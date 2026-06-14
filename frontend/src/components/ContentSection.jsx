/**
 * ContentSection
 * White card below the hero: title, lead paragraph, bullet list, reporter note.
 * Typography and spacing match capgemini.integrityline.com exactly.
 */
export default function ContentSection() {
  return (
    <section className="bg-white border border-t-0 border-capgemini-border px-10 pt-8 pb-0">

      {/* ── Title ── */}
      <h1 className="text-center text-[27px] font-bold text-[#1a1a2e] mb-6 leading-tight">
        SpeakUp &#8211; Ethics helpline
      </h1>

      {/* ── Lead (blue bold) ── */}
      <p className="font-bold text-capgemini-navy text-[14.5px] leading-relaxed mb-4">
        SpeakUp is a web and phone-based ethics reporting, incident management
        and advisory tool, licensed from an independent service provider.
        By taking action, you contribute to making Capgemini a better and
        ethical workplace for everyone.
      </p>

      {/* ── Body ── */}
      <p className="text-[13.5px] text-capgemini-text leading-relaxed mb-3">
        SpeakUp is voluntary, confidential, and allows anonymity. It is managed
        by our Group Ethics function and supported by our global network of
        General Counsels, Ethics &amp; Compliance Officers and HR investigators.
        SpeakUp is available to all Capgemini stakeholders:
      </p>

      {/* ── Bullet list ── */}
      <ul className="list-disc pl-6 text-[13.5px] text-capgemini-text leading-relaxed mb-4 space-y-1">
        <li>
          <strong>internal:</strong> our employee base (permanent headcount,
          temporary agency staff, freelancers, independent workers, employees
          of subcontractors, and trainees) and
        </li>
        <li>
          <strong>external:</strong> including but not limited to clients,
          suppliers, business partners, job applicants, and shareholders, and
          those of its affiliates.
        </li>
      </ul>

      {/* ── Reporter note ── */}
      <p className="text-[13.5px] text-capgemini-text leading-relaxed pb-7">
        A &#8220;reporter&#8221; is any person reporting an alert that is in
        the scope of SpeakUp policy.
      </p>

    </section>
  )
}
