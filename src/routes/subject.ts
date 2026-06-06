import express from 'express';
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  sql,
} from 'drizzle-orm';
import { departments, subjects} from '../db/schema/index.js';
import { db } from '../db/index.js';

const router = express.Router();
//Get all subjects with optional searching and filtering
router.get('/', async (req, res) => {
  try {
    const {search,department,page=1,limit=10} = req.query;
    const currentPage = Math.max(1,parseInt(page as string, 10) || 1);
    const limitPerPage = Math.max(1,parseInt(limit as string, 10) || 10);
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];
    if(search){
      filterConditions.push(or(
        ilike(subjects.name,`%${search}%`),
        ilike(subjects.code,`%${search}%`),
      ));
    }

    if(department){
      const deptPattern = `%${String(department).replace(/%/g, '\\%')}%`;
      filterConditions.push(ilike(departments.name, deptPattern));
    }

    const whereClause = filterConditions.length>0? and(...filterConditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause || undefined);

    const totalCount = countResult[0]?.count ?? 0;

    const subjectsList = await db
      .select({
        ...getTableColumns(subjects as any),
        department: { ...getTableColumns(departments as any) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause || undefined)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({ data: subjectsList, total: totalCount, page: currentPage, limit: limitPerPage, totalPages: Math.ceil(totalCount/limitPerPage) });
  }
  catch (error) {
    console.error(`GET /subjects error: ${error}`);
    res.status(500).json({ error: `failed to get subjects from server` });
  }
})

export default router;