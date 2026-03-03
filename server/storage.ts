import { type Term, type Course, type InsertTerm, type InsertCourse, type UpdateCourse, type TermWithCourses, type User, type InsertUser, users, terms, courses } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: { id: string; email: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<void>;
  
  // Terms
  getTerms(userId: string): Promise<TermWithCourses[]>;
  getTerm(id: string, userId: string): Promise<TermWithCourses | undefined>;
  createTerm(term: InsertTerm): Promise<Term>;
  deleteTerm(id: string, userId: string): Promise<boolean>;
  updateTermStatus(id: string, status: string, userId: string): Promise<Term | undefined>;
  
  // Courses
  getCourses(termId: string, userId: string): Promise<Course[]>;
  getCourse(id: string, userId: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: UpdateCourse, userId: string): Promise<Course | undefined>;
  deleteCourse(id: string, userId: string): Promise<boolean>;
  
  // Bulk operations
  bulkCreateData(data: { terms: InsertTerm[], courses: InsertCourse[] }, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: { id: string; email: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<void> {
    await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
        },
      });
  }

  // Terms operations
  async getTerms(userId: string): Promise<TermWithCourses[]> {
    const userTerms = await db
      .select()
      .from(terms)
      .where(eq(terms.userId, userId))
      .orderBy(terms.year, terms.season);

    const termsWithCourses: TermWithCourses[] = [];
    
    for (const term of userTerms) {
      const termCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.termId, term.id));
        
      termsWithCourses.push({
        ...term,
        courses: termCourses
      });
    }
    
    return termsWithCourses.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const seasonOrder = { spring: 4, summer: 3, fall: 2, winter: 1 };
      return (seasonOrder[b.season as keyof typeof seasonOrder] || 0) - (seasonOrder[a.season as keyof typeof seasonOrder] || 0);
    });
  }

  async getTerm(id: string, userId: string): Promise<TermWithCourses | undefined> {
    const [term] = await db
      .select()
      .from(terms)
      .where(and(eq(terms.id, id), eq(terms.userId, userId)));
    
    if (!term) return undefined;
    
    const termCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.termId, id));
    
    return {
      ...term,
      courses: termCourses
    };
  }

  async createTerm(insertTerm: InsertTerm): Promise<Term> {
    const [term] = await db
      .insert(terms)
      .values(insertTerm)
      .returning();
    return term;
  }

  async deleteTerm(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(terms)
      .where(and(eq(terms.id, id), eq(terms.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async updateTermStatus(id: string, status: string, userId: string): Promise<Term | undefined> {
    const [term] = await db
      .update(terms)
      .set({ status })
      .where(and(eq(terms.id, id), eq(terms.userId, userId)))
      .returning();
    return term;
  }

  // Course operations
  async getCourses(termId: string, userId: string): Promise<Course[]> {
    // Verify term belongs to user first
    const [term] = await db
      .select()
      .from(terms)
      .where(and(eq(terms.id, termId), eq(terms.userId, userId)));
    
    if (!term) return [];

    return db
      .select()
      .from(courses)
      .where(eq(courses.termId, termId));
  }

  async getCourse(id: string, userId: string): Promise<Course | undefined> {
    const [result] = await db
      .select({
        course: courses,
        term: terms
      })
      .from(courses)
      .innerJoin(terms, eq(courses.termId, terms.id))
      .where(and(eq(courses.id, id), eq(terms.userId, userId)));
    
    return result?.course;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }

  async updateCourse(id: string, updateData: UpdateCourse, userId: string): Promise<Course | undefined> {
    const [result] = await db
      .update(courses)
      .set(updateData)
      .from(terms)
      .where(and(
        eq(courses.id, id),
        eq(courses.termId, terms.id),
        eq(terms.userId, userId)
      ))
      .returning();
    return result;
  }

  async deleteCourse(id: string, userId: string): Promise<boolean> {
    // First verify the course belongs to the user by checking the term ownership
    const [courseToDelete] = await db
      .select({ id: courses.id })
      .from(courses)
      .innerJoin(terms, eq(courses.termId, terms.id))
      .where(and(eq(courses.id, id), eq(terms.userId, userId)));
    
    if (!courseToDelete) {
      return false; // Course not found or doesn't belong to user
    }
    
    const result = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();
    return result.length > 0;
  }

  // Bulk operations for CSV import
  async bulkCreateData(data: { terms: InsertTerm[], courses: InsertCourse[] }, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Insert terms first
      if (data.terms.length > 0) {
        await tx.insert(terms).values(data.terms);
      }
      
      // Insert courses
      if (data.courses.length > 0) {
        await tx.insert(courses).values(data.courses);
      }
    });
  }
}

export const storage = new DatabaseStorage();
