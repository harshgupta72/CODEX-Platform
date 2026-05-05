'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import type { CourseData, Domain } from '@/types';
import ReadTime from './ReadTime';

interface Props {
  courses:    CourseData[];
  domains:    Domain[];
  wordCounts: Record<string, number>;
}

export default function CourseGrid({ courses, domains, wordCounts }: Props) {
  const [active, setActive] = useState<string>('all');

  const visible = useMemo(
    () => active === 'all' ? courses : courses.filter(c => c.domain === active),
    [courses, active]
  );

  // Per-domain counts for the chip labels
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: courses.length };
    for (const d of domains) m[d.id] = courses.filter(c => c.domain === d.id).length;
    return m;
  }, [courses, domains]);

  return (
    <>
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <FilterChip
          active={active === 'all'}
          onClick={() => setActive('all')}
          label="All"
          count={counts.all}
          icon="apps"
          color="#8d4b00"
        />
        {domains.map(d => (
          <FilterChip
            key={d.id}
            active={active === d.id}
            onClick={() => setActive(d.id)}
            label={d.label}
            count={counts[d.id] ?? 0}
            icon={d.icon}
            color={d.color}
          />
        ))}
      </div>

      {/* Course grid */}
      {visible.length === 0 ? (
        <div className="py-20 text-center font-serif text-[15px] text-[#887364] dark:text-[#8d93a3]">
          No courses in this domain yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visible.map(course => (
            <Link key={course.id} href={`/courses/${course.id}`}
              className="group relative bg-white dark:bg-[#0f1115]
                border border-[#e7e5e4] dark:border-[#2e3138] rounded-2xl overflow-hidden
                hover:shadow-[0_10px_32px_rgba(141,75,0,.12)] dark:hover:shadow-[0_10px_32px_rgba(0,0,0,.4)]
                hover:-translate-y-1 transition-all duration-200
                flex flex-col">

              <div className="h-1" style={{ background: course.color }} />

              <div className="p-6 flex flex-col flex-1">
                <div className="text-[11px] font-bold text-[#887364] uppercase tracking-widest mb-1">
                  {course.subtitle}
                </div>
                <h2 className="text-xl font-black text-[#231a13] dark:text-[#e6e8ee]
                  tracking-tight mb-2 group-hover:text-[#8d4b00] transition-colors">
                  {course.title}
                </h2>
                <p className="font-serif text-[15px] text-[#554336] dark:text-[#8d93a3]
                  leading-relaxed mb-4 flex-1">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {course.tags.slice(0, 5).map(tag => (
                    <span key={tag}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                        bg-[#f2dfd3] dark:bg-[#1a1c22]
                        text-[#554336] dark:text-[#8d93a3]
                        border border-[#dbc2b0] dark:border-[#363c48]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-[#f2dfd3] dark:border-[#2e3138]
                  text-[11px] font-semibold text-[#887364] dark:text-[#8d93a3]">
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#8d4b00] dark:text-[#fbbf24]"
                      style={{ fontSize: 12 }}>schedule</span>
                    <ReadTime wordCount={wordCounts[course.id] ?? 0} />
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#8d4b00] dark:text-[#fbbf24]"
                      style={{ fontSize: 12 }}>layers</span>
                    {course.chapters} chapters
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#8d4b00] dark:text-[#fbbf24]"
                      style={{ fontSize: 12 }}>calendar_today</span>
                    {course.days} days
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#8d4b00] dark:text-[#fbbf24]"
                      style={{ fontSize: 12 }}>signal_cellular_alt</span>
                    {course.level}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  active, onClick, label, count, icon, color,
}: {
  active: boolean; onClick: () => void; label: string; count: number; icon: string; color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        text-[12px] font-semibold transition-all cursor-pointer
        ${active
          ? 'text-white shadow-sm'
          : 'bg-white dark:bg-[#1a1c22] text-[#554336] dark:text-[#8d93a3] border border-[#dbc2b0] dark:border-[#363c48] hover:border-[#c97000] dark:hover:border-[#fbbf24]'}`}
      style={active ? { background: color, borderColor: color } : undefined}>
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{icon}</span>
      {label}
      <span className={`text-[10.5px] font-black ml-0.5 px-1.5 rounded-full
        ${active ? 'bg-white/25' : 'bg-[#f2dfd3] dark:bg-[#0f1115] text-[#887364] dark:text-[#5d6373]'}`}>
        {count}
      </span>
    </button>
  );
}
