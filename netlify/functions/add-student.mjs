import { neon } from '@netlify/neon';

const sql = neon();

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { studentId, fullName, password, gradeLevel } = await req.json();

    if (!studentId || !fullName || !password) {
      return new Response(JSON.stringify({ error: 'Student ID, full name and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await sql`
      INSERT INTO students (student_id, full_name, password, grade_level)
      VALUES (${studentId}, ${fullName}, ${password}, ${gradeLevel || 1})
    `;

    return new Response(JSON.stringify({ success: true, message: `Student ${fullName} added successfully` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    if (error.message?.includes('unique')) {
      return new Response(JSON.stringify({ error: 'Student ID already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.error('Add student error:', error);
    return new Response(JSON.stringify({ error: 'Server error. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/api/add-student' };
