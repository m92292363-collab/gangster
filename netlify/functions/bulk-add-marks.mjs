import { neon } from '@netlify/neon';
const sql = neon();

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const { marks, subject, academicYear, term } = await req.json();
    if (!marks || !Array.isArray(marks) || marks.length === 0 || !subject || !academicYear || !term) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    let savedCount = 0;
    let errors = [];
    for (const mark of marks) {
      const { studentId, score, grade } = mark;
      if (studentId === undefined || score === undefined || !grade) continue;
      try {
        const [existing] = await sql`
          SELECT id FROM results 
          WHERE student_id = ${studentId} AND subject = ${subject} 
          AND academic_year = ${academicYear} AND term = ${term}`;
        if (existing) {
          await sql`UPDATE results SET score = ${score}, grade = ${grade}
            WHERE student_id = ${studentId} AND subject = ${subject}
            AND academic_year = ${academicYear} AND term = ${term}`;
        } else {
          await sql`INSERT INTO results (student_id, subject, score, grade, academic_year, term)
            VALUES (${studentId}, ${subject}, ${score}, ${grade}, ${academicYear}, ${term})`;
        }
        savedCount++;
      } catch (err) { errors.push({ studentId, error: err.message }); }
    }
    return new Response(JSON.stringify({ success: true, savedCount, errors }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/api/bulk-add-marks' };
