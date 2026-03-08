import { useState, useRef } from "react";
import { ArrowLeft, Download, Plus, Trash2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  education: { degree: string; institution: string; year: string }[];
  experience: { title: string; company: string; duration: string; description: string }[];
  projects: { name: string; description: string; tech: string }[];
}

const empty: ResumeData = {
  name: "",
  email: "",
  phone: "",
  summary: "",
  skills: [],
  education: [{ degree: "", institution: "", year: "" }],
  experience: [{ title: "", company: "", duration: "", description: "" }],
  projects: [{ name: "", description: "", tech: "" }],
};

export default function Resume() {
  const nav = useNavigate();
  const [data, setData] = useState<ResumeData>(empty);
  const [skillInput, setSkillInput] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof ResumeData>(key: K, val: ResumeData[K]) =>
    setData((p) => ({ ...p, [key]: val }));

  const addSkill = () => {
    if (!skillInput.trim()) return;
    set("skills", [...data.skills, skillInput.trim()]);
    setSkillInput("");
  };

  const handlePrint = () => {
    const el = previewRef.current;
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>${data.name || "Resume"}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 28px; margin-bottom: 4px; }
        h2 { font-size: 16px; border-bottom: 2px solid #0d9488; padding-bottom: 4px; margin: 20px 0 10px; text-transform: uppercase; color: #0d9488; }
        h3 { font-size: 14px; margin-bottom: 2px; }
        p, li { font-size: 13px; line-height: 1.6; }
        .contact { color: #666; font-size: 13px; margin-bottom: 8px; }
        .skills { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill { background: #f0fdfa; border: 1px solid #99f6e4; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
        .entry { margin-bottom: 12px; }
        .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
        .duration { color: #666; font-size: 12px; }
        ul { padding-left: 18px; }
        @media print { body { padding: 20px; } }
      </style></head><body>${el.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Form Panel */}
      <div className="w-full lg:w-1/2 overflow-y-auto border-r border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => nav("/")} className="flex items-center justify-center h-9 w-9 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-foreground">Resume Builder</h1>
        </div>

        <div className="space-y-6 max-w-lg">
          {/* Personal Info */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Personal Information</h2>
            <input placeholder="Full Name" value={data.name} onChange={(e) => set("name", e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input placeholder="Email" value={data.email} onChange={(e) => set("email", e.target.value)} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input placeholder="Phone" value={data.phone} onChange={(e) => set("phone", e.target.value)} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <textarea placeholder="Professional Summary (2-3 sentences)" value={data.summary} onChange={(e) => set("summary", e.target.value)} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </section>

          {/* Skills */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Skills</h2>
            <div className="flex gap-2">
              <input placeholder="Add a skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <button onClick={addSkill} className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm"><Plus className="h-4 w-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-foreground">
                  {s}
                  <button onClick={() => set("skills", data.skills.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Education</h2>
              <button onClick={() => set("education", [...data.education, { degree: "", institution: "", year: "" }])} className="text-xs text-primary hover:underline">+ Add</button>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} className="space-y-2 p-3 rounded-lg border border-border">
                <input placeholder="Degree (e.g., B.Tech Computer Science)" value={edu.degree} onChange={(e) => { const c = [...data.education]; c[i] = { ...c[i], degree: e.target.value }; set("education", c); }} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <input placeholder="Institution" value={edu.institution} onChange={(e) => { const c = [...data.education]; c[i] = { ...c[i], institution: e.target.value }; set("education", c); }} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  <input placeholder="Year" value={edu.year} onChange={(e) => { const c = [...data.education]; c[i] = { ...c[i], year: e.target.value }; set("education", c); }} className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                </div>
                {data.education.length > 1 && (
                  <button onClick={() => set("education", data.education.filter((_, j) => j !== i))} className="text-xs text-destructive hover:underline">Remove</button>
                )}
              </div>
            ))}
          </section>

          {/* Experience */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Experience</h2>
              <button onClick={() => set("experience", [...data.experience, { title: "", company: "", duration: "", description: "" }])} className="text-xs text-primary hover:underline">+ Add</button>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} className="space-y-2 p-3 rounded-lg border border-border">
                <input placeholder="Job Title" value={exp.title} onChange={(e) => { const c = [...data.experience]; c[i] = { ...c[i], title: e.target.value }; set("experience", c); }} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <input placeholder="Company" value={exp.company} onChange={(e) => { const c = [...data.experience]; c[i] = { ...c[i], company: e.target.value }; set("experience", c); }} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  <input placeholder="Duration" value={exp.duration} onChange={(e) => { const c = [...data.experience]; c[i] = { ...c[i], duration: e.target.value }; set("experience", c); }} className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <textarea placeholder="Description of responsibilities" value={exp.description} onChange={(e) => { const c = [...data.experience]; c[i] = { ...c[i], description: e.target.value }; set("experience", c); }} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                {data.experience.length > 1 && (
                  <button onClick={() => set("experience", data.experience.filter((_, j) => j !== i))} className="text-xs text-destructive hover:underline">Remove</button>
                )}
              </div>
            ))}
          </section>

          {/* Projects */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Projects</h2>
              <button onClick={() => set("projects", [...data.projects, { name: "", description: "", tech: "" }])} className="text-xs text-primary hover:underline">+ Add</button>
            </div>
            {data.projects.map((proj, i) => (
              <div key={i} className="space-y-2 p-3 rounded-lg border border-border">
                <input placeholder="Project Name" value={proj.name} onChange={(e) => { const c = [...data.projects]; c[i] = { ...c[i], name: e.target.value }; set("projects", c); }} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                <textarea placeholder="Project Description" value={proj.description} onChange={(e) => { const c = [...data.projects]; c[i] = { ...c[i], description: e.target.value }; set("projects", c); }} rows={2} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                <input placeholder="Technologies Used" value={proj.tech} onChange={(e) => { const c = [...data.projects]; c[i] = { ...c[i], tech: e.target.value }; set("projects", c); }} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                {data.projects.length > 1 && (
                  <button onClick={() => set("projects", data.projects.filter((_, j) => j !== i))} className="text-xs text-destructive hover:underline">Remove</button>
                )}
              </div>
            ))}
          </section>

          <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 font-medium hover:bg-primary/90 transition-colors">
            <Download className="h-5 w-5" />
            Download as PDF
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="hidden lg:block w-1/2 overflow-y-auto bg-background p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          ref={previewRef}
          className="mx-auto max-w-[700px] bg-card rounded-xl shadow-elevated p-10 min-h-[800px]"
        >
          {data.name ? (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground">{data.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {[data.email, data.phone].filter(Boolean).join(" • ")}
              </p>

              {data.summary && (
                <>
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider mt-5 mb-2 border-b-2 border-primary pb-1">Summary</h2>
                  <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
                </>
              )}

              {data.skills.length > 0 && (
                <>
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider mt-5 mb-2 border-b-2 border-primary pb-1">Skills</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {data.skills.map((s, i) => (
                      <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-foreground">{s}</span>
                    ))}
                  </div>
                </>
              )}

              {data.education.some((e) => e.degree) && (
                <>
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider mt-5 mb-2 border-b-2 border-primary pb-1">Education</h2>
                  {data.education.filter((e) => e.degree).map((edu, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-semibold text-foreground">{edu.degree}</h3>
                        <span className="text-xs text-muted-foreground">{edu.year}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{edu.institution}</p>
                    </div>
                  ))}
                </>
              )}

              {data.experience.some((e) => e.title) && (
                <>
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider mt-5 mb-2 border-b-2 border-primary pb-1">Experience</h2>
                  {data.experience.filter((e) => e.title).map((exp, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-semibold text-foreground">{exp.title}</h3>
                        <span className="text-xs text-muted-foreground">{exp.duration}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{exp.company}</p>
                      <p className="text-xs text-foreground leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </>
              )}

              {data.projects.some((p) => p.name) && (
                <>
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wider mt-5 mb-2 border-b-2 border-primary pb-1">Projects</h2>
                  {data.projects.filter((p) => p.name).map((proj, i) => (
                    <div key={i} className="mb-3">
                      <h3 className="text-sm font-semibold text-foreground">{proj.name}</h3>
                      <p className="text-xs text-foreground leading-relaxed">{proj.description}</p>
                      {proj.tech && <p className="text-xs text-muted-foreground mt-0.5">Tech: {proj.tech}</p>}
                    </div>
                  ))}
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Fill in the form to see your resume preview</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
