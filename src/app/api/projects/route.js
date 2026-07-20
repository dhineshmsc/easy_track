import { NextResponse } from 'next/server';
import { getProjectsCol, getStoriesCol, getTasksCol } from '../../../backend/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company');
    const tree = searchParams.get('tree') === 'true';

    if (!company) {
      return NextResponse.json({ detail: "company is required" }, { status: 400 });
    }

    const projectsCol = await getProjectsCol();
    const storiesCol = await getStoriesCol();
    const tasksCol = await getTasksCol();

    if (tree) {
      const projectsCursor = projectsCol.find({ company }).sort({ p_seq: 1 });
      const projects = await projectsCursor.toArray();
      const project_ids = projects.map(p => String(p._id));

      const stories = await storiesCol.find({ project_id: { $in: project_ids } }).sort({ s_seq: 1 }).toArray();
      const story_ids = stories.map(s => String(s._id));

      const tasks = await tasksCol.find({ story_id: { $in: story_ids } }).sort({ created_at: -1 }).toArray();

      return NextResponse.json({
        projects: projects.map(p => {
          p._id = String(p._id);
          if (p.created_at && p.created_at instanceof Date) {
            p.created_at = p.created_at.toISOString();
          }
          return p;
        }),
        stories: stories.map(s => {
          s._id = String(s._id);
          if (s.created_at && s.created_at instanceof Date) {
            s.created_at = s.created_at.toISOString();
          }
          if (s.end_date && s.end_date instanceof Date) {
            s.end_date = s.end_date.toISOString();
          }
          return s;
        }),
        tasks: tasks.map(t => {
          t._id = String(t._id);
          if (t.created_at && t.created_at instanceof Date) {
            t.created_at = t.created_at.toISOString();
          }
          if (t.end_date && t.end_date instanceof Date) {
            t.end_date = t.end_date.toISOString();
          }
          return t;
        })
      });
    }

    const cursor = projectsCol.find({ company }).sort({ p_seq: 1 });
    const docs = await cursor.toArray();

    const projects = [];
    for (const doc of docs) {
      const p = { ...doc };
      p._id = String(p._id);

      if (!p.status) {
        p.status = "Not Started";
      }

      if (!p.created_at) {
        p.created_at = new Date();
        await projectsCol.updateOne({ _id: doc._id }, { $set: { created_at: p.created_at } });
      } else if (p.created_at instanceof Date) {
        p.created_at = p.created_at.toISOString();
      }

      const project_id = p._id;
      const stories = await storiesCol.find({ project_id }).toArray();
      const story_ids = stories.map(s => String(s._id));

      p.story_count = stories.length;

      if (story_ids.length > 0) {
        const tasks = await tasksCol.find({ story_id: { $in: story_ids } }).toArray();
        p.task_count = tasks.length;

        let pending = 0;
        let progress = 0;
        let completed = 0;
        let total_est = 0.0;

        for (const t of tasks) {
          const status = t.status || "To Do";
          if (status === "To Do") {
            pending += 1;
          } else if (status === "In Progress") {
            progress += 1;
          } else if (status === "Done") {
            completed += 1;
          }
          total_est += parseFloat(t.estimate_hours || 0);
        }

        p.pending_tasks = pending;
        p.progress_tasks = progress;
        p.completed_tasks = completed;
        p.total_estimate_hours = total_est;
      } else {
        p.task_count = 0;
        p.pending_tasks = 0;
        p.progress_tasks = 0;
        p.completed_tasks = 0;
        p.total_estimate_hours = 0.0;
      }

      projects.push(p);
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, description, company, estimate_hours, end_date, priority, assigned_user, reporter, status } = body;

    if (!name || !company) {
      return NextResponse.json({ detail: "name and company are required" }, { status: 400 });
    }

    const projectsCol = await getProjectsCol();
    const count = await projectsCol.countDocuments({ company });
    const p_seq = count + 1;
    const custom_id = `p${p_seq}`;

    const project_doc = {
      name,
      description: description || null,
      company,
      estimate_hours: estimate_hours !== undefined ? parseFloat(estimate_hours) : 0.0,
      end_date: end_date || null,
      priority: priority || 'Medium',
      assigned_user: assigned_user || null,
      reporter: reporter || null,
      status: status || 'Not Started',
      p_seq,
      custom_id,
      created_at: new Date(),
      owner_id: "system"
    };

    const result = await projectsCol.insertOne(project_doc);
    project_doc._id = String(result.insertedId);
    project_doc.created_at = project_doc.created_at.toISOString();

    return NextResponse.json(project_doc);
  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json({ detail: error.message || "Internal Server Error" }, { status: 500 });
  }
}
