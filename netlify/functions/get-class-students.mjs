import { neon } from '@netlify/neon';
const sql = neon();

export default async (req) => {
  const url = new URL(req.url);
  const grade = url.searchParams.get('grade');
  const className = url.searchParams.get('class');

  if (!grade) {
    return new Response(JSON.stringify({ error: 'Grade is required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let students;
    if (className) {
      students = await sql`
        SELECT s.id, s.student_id, s.full_name, s.grade_level, s.grade, s.class,
          COUNT(r.id) as result_count,
          COALESCE(SUM(r.score), 0) as total_score,
          COALESCE(ROUND(AVG(r.score)::numeric, 1), 0) as avg_score
        FROM students s
        LEFT JOIN results r ON s.student_id = r.student_id
        WHERE s.grade = ${grade} AND s.class = ${className}
        GROUP BY s.id, s.student_id, s.full_name, s.grade_level, s.grade, s.class
        ORDER BY s.full_name`;
    } else {
      students = await sql`
        SELECT s.id, s.student_id, s.full_name, s.grade_level, s.grade, s.class,
          COUNT(r.id) as result_count,
          COALESCE(SUM(r.score), 0) as total_score,
          COALESCE(ROUND(AVG(r.score)::numeric, 1), 0) as avg_score
        FROM students s
        LEFT JOIN results r ON s.student_id = r.student_id
        WHERE s.grade = ${grade}
        GROUP BY s.id, s.student_id, s.full_name, s.grade_level, s.grade, s.class
        ORDER BY s.class, s.full_name`;
    }

    const classCounts = await sql`
      SELECT class, COUNT(*) as student_count
      FROM students WHERE grade = ${grade}
      GROUP BY class ORDER BY class`;

    return new Response(JSON.stringify({ success: true, students, classCounts }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get class students error:', error);
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/api/get-class-students' };
