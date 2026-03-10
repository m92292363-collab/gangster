import { neon } from "@netlify/neon";

export default async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const url = new URL(req.url);
    const classLevel   = url.searchParams.get("classLevel");
    const classSection = url.searchParams.get("classSection");
    if (!classLevel || !classSection) {
      return new Response(
        JSON.stringify({ success: false, error: "classLevel and classSection are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT student_id, full_name, grade_level, class_level, class_section
      FROM students
      WHERE class_level   = ${classLevel}
        AND class_section = ${classSection}
      ORDER BY full_name ASC
    `;
    return new Response(
      JSON.stringify({ success: true, students: rows }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("get-students-by-class error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "خطأ في استرجاع الطلاب" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = { path: "/api/get-students-by-class" };
