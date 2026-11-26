// data/pitAddendum.js
// Zero-overlap operational layer ("The Pit") for Behavioral Intelligence Workstation (M01-M12)
// Status: Pass C Complete (ALL 12 MODULES M01-M12 DEEPENED · 13-CARD PIT CODEX)
// Pure ES module — drop directly into /data/pitAddendum.js (zero external dependencies)

export const PIT_STAGES = {
  white: { id: "white", label: "Stage 1 · Telemetry & Authority", accent: "text-rose-400 border-rose-500/40 bg-rose-500/10" },
  blue: { id: "blue", label: "Stage 2 · Profiling & Elicitation", accent: "text-amber-300 border-amber-500/40 bg-amber-500/10" },
  brown: { id: "brown", label: "Stage 3 · Covert Syntax", accent: "text-lime-300 border-lime-500/40 bg-lime-500/10" },
  black: { id: "black", label: "Stage 4 · Compliance Chains & Space", accent: "text-fuchsia-300 border-fuchsia-500/40 bg-fuchsia-500/10" },
};

export const PIT_MODULE_ADDENDA = {
  M01: {
    moduleId: "M01",
    pitStage: "white",
    status: "DEEPENED",
    operationalThesis:
      "Perceptual calibration is not passive observation; it is the baseline defense against confirmation bias and temporal hijacking in negotiations, interviews, and bureaucratic rooms.",
    liveRoomCounterPlay: [
      {
        title: "Neutralizing Institutional Numbness vs. True Friction",
        setting: "Administrative windows, HR screenings, procurement calls",
        signal: "Flat affect, minimal eye contact, clipped cadence from the first sentence.",
        counterMove:
          "Log the entire flat posture as their zero-point (score: 0). Never treat baseline institutional fatigue as hostility or deception. Only track a delta—a sudden shift in blink rate, hand motion, or pitch tied directly to a specific document, number, or question you introduce.",
        breakLine: "Hold 1 full breath before responding to clipped tone; match clarity, not speed.",
      },
      {
        title: "Hunting Friction Points Instead of Liars",
        setting: "Negotiation & interview discovery",
        signal: "Sudden cluster shift (illustrator freeze + posture pivot + vocal pitch lift) right after a routine question.",
        counterMove:
          "Do not accuse or confront. Treat the spike as a targeting reticle showing where risk, hidden vetoes, or unspoken constraints live. Drop into stillness, pause two seconds, and ask one narrow process question.",
        breakLine: "\"Walk me through the exact steps between your desk and final sign-off.\"",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Robert Cialdini (Pre-Suasion)",
        insight:
          "\"What is focal is causal.\" If you enter a room hunting for deception, your attention makes normal fidgeting focal and fabricates intent. Anchoring strictly to baseline deltas prevents self-induced paranoia.",
      },
      {
        author: "Robert Greene (The Laws of Human Nature)",
        insight:
          "The Law of Role-Playing confirms Hughes's sharpest telemetry rule: skilled operators can fake any single channel (warm words, open smile). Almost no one sustains multi-channel synchrony under load. The true read is always the fracture between channels.",
      },
    ],
    operatorShadow: [
      {
        trap: "Diagnostic Tunnel Vision",
        mechanism:
          "Spotting a clean behavioral cluster triggers an ego rush (\"I caught them\"). Locking onto your read too early closes your ears to new, disconfirming data.",
        calibration: "Every telemetry spike buys you one sharper question—never a courtroom verdict.",
      },
      {
        trap: "Cognitive Load Misattribution",
        mechanism:
          "Complex math, careful phrasing, or working in a second language produces the exact same illustrator freeze and blink suppression as fabrication.",
        calibration: "Rule out working-memory load before escalating your read.",
      },
    ],
    codexIds: ["PIT-02"],
  },

  M02: {
    moduleId: "M02",
    pitStage: "white",
    status: "DEEPENED",
    operationalThesis:
      "Persuasion is what you have to use when you lack authority. In live rooms, status is rarely contested by shouting—it is won or lost over temporal dominance, terminal vocal pitch, and stillness.",
    liveRoomCounterPlay: [
      {
        title: "Winning the Silence Vacuum",
        setting: "Panel interviews, fee pushback, bureaucratic denials",
        signal: "Counterpart delivers a flat rejection or low anchor and stares silently.",
        counterMove:
          "Absorb 2–3 full seconds of silence without nodding, shifting weight, or adding a second justification. Rushing to fill silence accepts the burden of proof and signals that their approval is scarcer than your time.",
        breakLine: "Deliver your position on a downward vocal inflection, then stop talking.",
      },
      {
        title: "Countering Deliberate Tempo-Stripping",
        setting: "High-pressure vendor calls & impatient executives",
        signal: "Counterpart interrupts, glances at the clock, or speaks at double speed to rush concessions.",
        counterMove:
          "Refuse to match their frantic cadence. Pause one full beat after they finish, lower your volume slightly (forcing them to allocate attention inward), and state your single point at your own unhurried pace.",
        breakLine: "\"Let's pause on the timeline—before we move fast, we need the scope terms in writing.\"",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Erving Goffman (Interaction Ritual)",
        insight:
          "Status splits into demeanor (how you carry yourself) and deference (the respect others extend). Deference is elicited by intact demeanor; rapid nodding, uptalk, and over-explaining crack your demeanor and automatically downgrade the deference you receive.",
      },
      {
        author: "Deborah Gruenfeld (Acting with Power)",
        insight:
          "Distinguishes brittle power-over (rigid, cold, defensive) from playing high (expansive, grounded, unhurried). This explains why Hughes pairs Discipline with Enjoyment: relaxed ease under fire is the ultimate tell of someone with options.",
      },
      {
        author: "Jeffrey Pfeffer (Power)",
        insight:
          "Perceived power precedes actual leverage. Operators who project calm economy of words routinely receive administrative flexibility and concessions that equally qualified, deferential peers never get.",
      },
    ],
    operatorShadow: [
      {
        trap: "The Precision Leak (Over-Explaining)",
        mechanism:
          "High-competence specialists and interpreters reflexively eliminate ambiguity by adding extra reasons. Under Pit physics, unsolicited justification looks identical to low-status pleading and hands the other side more surface area to attack.",
        calibration: "Cap boundary rationales at one clean sentence—or zero under pressure.",
      },
      {
        trap: "Brittle Stillness",
        mechanism:
          "Over-correcting Authority Killers by turning into a cold statue triggers threat defenses in collaborative or bureaucratic rooms.",
        calibration: "Pair physical stillness with loose shoulders and unhurried warmth (Hughes's Enjoyment pillar).",
      },
    ],
    codexIds: ["PIT-01"],
  },

  M03: {
    moduleId: "M03",
    pitStage: "white",
    status: "DEEPENED",
    operationalThesis:
      "In live rooms, the 123-cell Behavioral Table is not a lie detector—it is a real-time bandwidth and autonomic-leakage meter. Its operational edge comes from strict 30-second cluster discipline: isolating where cognitive load or defensive friction spikes before deciding where to press.",
    liveRoomCounterPlay: [
      {
        title: "The 30-Second Cluster Audit on Contract Clauses & Redlines",
        setting: "Commercial negotiations, vendor renewals, compensation talks",
        signal:
          "Within 30 seconds of a specific clause or number, three or more channels converge (e.g., illustrator freeze +2.5, ventral torso pivot/laptop pull +2.0, exit-foot turn +1.5, syntax stall +2.0, blink flurry +2.5), pushing the cluster past 11.0+.",
        counterMove:
          "Never challenge truthfulness directly. Treat the 11+ cluster as a pin dropped on the exact term that carries hidden cost, internal veto risk, or an undisclosed constraint. Hold your posture still, slow the room down, and ask one surgical, non-accusatory constraint question.",
        breakLine: "\"Notice we slowed down on that indemnification paragraph—what specific risk does your legal team flag there?\"",
      },
      {
        title: "Reading Lower-Body Leakage Against a Polished Upper Frame",
        setting: "Executive panel interviews, formal institutional briefings",
        signal:
          "Face stays smiling and voice stays collaborative while ankles lock tightly around chair legs, lead foot pivots toward the exit, or a hidden foot begins bouncing ('happy feet') the instant you state your fee, timeline, or conditions.",
        counterMove:
          "Weight the lower body over the smile. Humans police their faces from childhood; almost nobody polices their ankles. Do not push for a close against an active exit-foot pivot—pause the pitch and test structural alignment before spending more leverage.",
        breakLine: "\"Before I walk through phase two, does the phase-one structure actually fit how your team runs?\"",
      },
      {
        title: "Running a Working-Memory Control Check (Load vs. Concealment)",
        setting: "Technical interviews, audit reviews, bureaucratic intake",
        signal:
          "Abrupt illustrator freeze, gaze aversion, and slowed verbal fluency immediately after a dense multi-part question.",
        counterMove:
          "Rule out benign cognitive load before treating the freeze as evasion. Ask a low-stakes factual question of equal complexity. If fluency and natural hand gestures return on the low-stakes question and snap frozen again on the high-stakes term, you have a verified friction delta.",
        breakLine: "\"Take a second—no rush. Let's confirm the Q2 baseline first, then compare it to Q3.\"",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Daniel Kahneman (Thinking, Fast and Slow — Cognitive Load)",
        insight:
          "Explains the exact bottleneck behind Hughes's Illustrator Freeze: spontaneous speech and hand gestures share automated motor-linguistic bandwidth. When System 2 hijacks working memory to censor, edit, or fabricate a careful answer on the fly, it starves unconscious motor illustrators—causing hands to lock dead mid-clause.",
      },
      {
        author: "Erving Goffman (The Presentation of Self — Given vs. Given Off)",
        insight:
          "Goffman separates 'expressions given' (deliberate verbal scripts and social smiles) from 'expressions given off' (involuntary somatic leakage). Hughes's Behavioral Table is an operationalized scoring grid for the exact fracture between the two.",
      },
      {
        author: "Joe Navarro & Paul Ekman (Limbic Leakage Hierarchy)",
        insight:
          "Validates why Hughes assigns reliable diagnostic weight to ventral barriers and lower-body pivots: deliberate deception control concentrates in the face and vocal words, forcing autonomic flight/freeze energy downward into the torso, hands, and feet.",
      },
    ],
    operatorShadow: [
      {
        trap: "Single-Cue Confirmation Bias",
        mechanism:
          "Spotting one isolated neck touch, crossed arm, or foot shift and retrofitting a suspicious story around it—poisoning rapport over normal physical comfort.",
        calibration: "Enforce the 3-channel / 30-second / 11+ cluster rule rigidly; isolated cues score zero.",
      },
      {
        trap: "Telemetry Paralysis (Missing the Verbal Concession)",
        mechanism:
          "Burning so much working memory scoring DRS weights that you miss a subtle verbal opening, a softened term, or an embedded presupposition.",
        calibration: "Run telemetry as peripheral radar; only tally a cluster when a load-bearing number, deadline, or boundary hits the table.",
      },
      {
        trap: "Blindness to Your Own Autonomic Broadcast",
        mechanism:
          "Scanning the counterpart's hands and ankles while your own shoulders tighten, your pen clicks, or your breathing turns shallow.",
        calibration: "Run a 1-second check on your own physical stillness before trusting any read across the table.",
      },
    ],
    codexIds: ["PIT-02"],
  },

  M04: {
    moduleId: "M04",
    pitStage: "white",
    status: "DEEPENED",
    operationalThesis:
      "Because the face is the most heavily policed channel in adult life, deliberate smiles are cheap—but involuntary micro-fractures (unilateral contempt, inward lip compression, and blink-rate suppression) act as real-time meters of status dismissal and verbal self-censorship.",
    liveRoomCounterPlay: [
      {
        title: "Disarming the Unilateral Lip Raise (Micro-Contempt)",
        setting: "Senior stakeholder reviews, adversarial interviews, institutional gatekeeping",
        signal:
          "A split-second, single-sided corner lift of the mouth (+3.0 DRS) immediately after you state a credential, fee, or proposal—often paired with polite, non-committal words.",
        counterMove:
          "Read it accurately: unilateral contempt is an involuntary status verdict ('you don't have leverage here' or 'you don't understand how this room works'). Never counter contempt by lecturing, stacking more credentials, or mirroring the sneer—defending your worth confirms their frame that you are auditioning. Hold one calm beat of stillness and hand them the burden of explanation as a peer.",
        breakLine: "\"It looks like you've seen this approach run into walls before—where does it usually break down on your end?\"",
      },
      {
        title: "Surfacing Lip Compression (Literal Motor Inhibition)",
        setting: "Contract negotiations, compensation reviews, administrative desks",
        signal:
          "Lips press thin and roll inward until the red disappears (+2.0 DRS) right after an offer or boundary, followed by a curt nod and a surface 'that's fine.'",
        counterMove:
          "Lip compression is physical motor braking—the brain clamping the mouth shut to hold back resentment, an objection, or a deal-killing constraint. Taking their polite 'fine' at face value guarantees silent post-meeting sabotage. Surface the withheld friction neutrally without guessing what it is.",
        breakLine: "\"You said that works, though I sense there's a catch on your side. Better we put it on the table now than hit it next week.\"",
      },
      {
        title: "Outlasting Blink Suppression & the Post-Statement Flurry",
        setting: "Fee anchoring, hard deadlines, bluff testing",
        signal:
          "Counterpart's blink rate drops sharply into a fixed, unblinking stare while delivering a hard claim ('this is our absolute ceiling'), followed by a rapid 4–6 blink flurry the second they finish.",
        counterMove:
          "The unblinking stare is active threat-monitoring—checking whether you flinched or bought the anchor. The rapid flurry afterward is autonomic cortisol venting. Do not nod, soften, or speak during the stare. Hold two seconds of relaxed eye contact until the flurry fires, then deliver your counter-anchor on a flat, downward pitch.",
        breakLine: "Hold 2 seconds of relaxed silence until the blink flurry lands, then: \"That ceiling doesn't cover this scope. Here is what fits that number.\"",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Paul Ekman & John Gottman (Contempt as Status Hierarchy)",
        insight:
          "Contempt is the only asymmetric universal facial expression—it explicitly asserts vertical superiority. In a negotiation, spotting a unilateral lip raise tells you immediately that the counterpart has shifted out of collaborative problem-solving into status combat.",
      },
      {
        author: "Daniel Shapiro (Beyond Reason — Status & Role Triggers)",
        insight:
          "Micro-expressions of contempt or tight lip compression frequently fire the exact second a counterpart feels their Status or Role was stepped on. Reading that flash lets you repair or bypass an identity snag before the entire negotiation locks into positional warfare.",
      },
      {
        author: "Robert Greene (The Laws of Human Nature — Masked Aggression)",
        insight:
          "In corporate, academic, and bureaucratic rooms, overt hostility carries institutional penalties, forcing aggression underground into facial micro-leakage. Catching the fracture between diplomatic syntax and a unilateral lip raise lets you raise your guard cleanly without waiting for an open insult.",
      },
    ],
    operatorShadow: [
      {
        trap: "Status Retaliation (The Expert's Counter-Lecture)",
        mechanism:
          "Catching a flash of contempt triggers an immediate ego spike to prove competence by citing data, titles, or airtight logic—which reads as defensive striving and lowers your standing.",
        calibration: "Treat contempt as telemetry about their assumptions or insecurity, never as a referendum on your competence.",
      },
      {
        trap: "Mind-Reading the Inhibition",
        mechanism:
          "Seeing lip compression and assuming you know the exact thought they are hiding. Often they are biting back frustration with their own leadership or budget, not with you.",
        calibration: "Open the door with a neutral prompt; never state your guess about their hidden motive as fact.",
      },
      {
        trap: "Predatory Facial Hyper-Fixation",
        mechanism:
          "Locking onto someone's mouth or eyelids to hunt for micro-expressions creates an uncanny, interrogative stare that puts counterparts on high alert.",
        calibration: "Keep a soft, natural conversational gaze; micro-fractures register cleanest when your attention is relaxed.",
      },
    ],
    codexIds: ["PIT-09", "PIT-02"],
  },

  M05: {
    moduleId: "M05",
    pitStage: "blue",
    status: "DEEPENED",
    operationalThesis:
      "Hard positional deadlocks are rarely about the math on the spreadsheet; they occur when a negotiation threatens a counterpart's dominant social need (Significance, Intelligence, Strength, Approval, Acceptance, or Pity). Trading cheap need-concessions lets you protect expensive economic terms.",
    liveRoomCounterPlay: [
      {
        title: "Paying in Significance/Intelligence Currency to Protect Price & Scope",
        setting: "Fee negotiations, executive buy-in, cross-departmental disputes",
        signal:
          "A senior counterpart stalls over a minor procedural detail, re-litigates solved technical points, or insists on redlining wording that has zero financial impact.",
        counterMove:
          "Recognize that they are fighting for Significance or Intelligence—not money. Stop arguing the math. Concede visible authorship and architectural credit (which costs you nothing) while holding your fee, timeline, and core boundaries completely rigid.",
        breakLine: "\"Your architecture on the legacy workflow is why this hasn't broken—you should own the rollout sequence. Within that, the fee and Friday cutoff stay fixed.\"",
      },
      {
        title: "Neutralizing the Pity-Hook & Hardship Frame",
        setting: "Vendor pushback, scope creep, delayed deliverables, colleague favors",
        signal:
          "Counterpart pivots from agreed terms into an exhaustive recital of how understaffed, exhausted, or unfairly squeezed they are—inviting you to rescue them by dropping your standard.",
        counterMove:
          "Separate empathy from subsidy. Acknowledge the strain in one flat, non-sarcastic sentence so they cannot cast you as cruel, then immediately re-anchor to the objective contract or options without absorbing their deficit.",
        breakLine: "\"Sounds like Q4 hit your team hard. Given that bandwidth, do you want to reduce scope to Phase 1 or shift the delivery date to next month?\"",
      },
      {
        title: "Decoupling Intelligence Flattery From Asymmetric Asks",
        setting: "Consulting scope creep, panel interviews, favors from higher-ups",
        signal:
          "Sudden, hyper-specific praise aimed directly at your analytical sharpness, bilingual precision, or indispensability ('nobody else here can see this like you do') delivered seconds before an uncompensated ask.",
        counterMove:
          "Treat timed flattery as a deliberate Significance/Intelligence hook designed to lower your critical scrutiny. Accept the compliment in two dry words, insert a one-second pause to sever the emotional bridge, and evaluate the request strictly on its cold operational math.",
        breakLine: "\"Appreciate that. Looking at the deliverables separately, adding that audit requires a separate SOW.\"",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Roger Fisher & Daniel Shapiro (Beyond Reason — The 5 Core Concerns)",
        insight:
          "Fisher & Shapiro map the exact relational side of Hughes's Six Social Needs: Significance/Intelligence map to Status and Appreciation; Approval/Acceptance map to Affiliation; Strength maps to Autonomy and Role. The Pit operationalizes the difference: Hughes shows how those exact needs get starved and weaponized under pressure.",
      },
      {
        author: "Robert Greene (The 48 Laws of Power — Law 13: Appeal to Self-Interest)",
        insight:
          "Never appeal to a counterpart's mercy or gratitude; appeal to the social need they are actively trying to feed. Once you identify whether the room runs on Significance (credit/visibility) or Strength (control/autonomy), every proposal can be wrapped in their currency without diluting your own leverage.",
      },
      {
        author: "Alfred Adler (Individual Psychology — Vertical Striving)",
        insight:
          "Adler notes that when people feel one-down, they compensate through vertical dominance (Strength/Significance) or horizontal victimhood (Pity). Both are power strategies—recognizing Pity as a bid for control prevents over-conscientious negotiators from subsidizing bad terms.",
      },
    ],
    operatorShadow: [
      {
        trap: "The Intelligence-Hook Reflex",
        mechanism:
          "As an analytical, multi-domain specialist, your highest-probability vulnerability is Significance/Intelligence flattery. When someone frames an unfair task as 'only you are sharp enough to handle this,' your ego wants to prove them right—costing you time and boundaries.",
        calibration: "Whenever praise immediately precedes an ask, mentally strip the praise out and read the bare request on paper.",
      },
      {
        trap: "Weaponizing Needs in Good-Faith Rooms",
        mechanism:
          "Over-feeding someone's ego with obvious flattery or manufactured deference to get a quick yes—which sharp peers immediately smell as transactional manipulation.",
        calibration: "Only validate real competence and genuine constraints; counterfeit praise destroys long-term credibility.",
      },
    ],
    codexIds: ["PIT-10", "PIT-04"],
  },

  M06: {
    moduleId: "M06",
    pitStage: "blue",
    status: "DEEPENED",
    operationalThesis:
      "Most persuasion failures are channel mismatches, not logic failures. Diagnosing a counterpart's Processing Filter (Cognitive, Emotional, Physical, Social) and Locus of Control (-100 Internal to +100 External) in the first 90 seconds tells you whether to pitch ROI, optics, concrete proof, or zero-risk compliance.",
    liveRoomCounterPlay: [
      {
        title: "Winning External-Locus Bureaucratic & Compliance Desks",
        setting: "Consulates, licensing windows, procurement, HR/legal gatekeepers",
        signal:
          "Language anchored outside personal agency: 'Policy requires...', 'My supervisor won't sign off unless...', 'That's just how the system processes it.'",
        counterMove:
          "Never argue fairness, personal urgency, or logical efficiency to an External-Locus gatekeeper—telling them a rule is silly threatens their safety and triggers rigid stonewalling. Pivot 100% into their locus: make your file the cleanest, lowest-audit-risk, rule-compliant item on their desk so saying yes protects them.",
        breakLine: "\"I want to make sure this clears your internal audit without kicking back to your desk—which exact certification line satisfies Section 4?\"",
      },
      {
        title: "Channel-Switching Out of Cognitive Overload",
        setting: "Client pitches, cross-functional negotiations, executive interviews",
        signal:
          "You present airtight data and step-by-step logic, and the counterpart's eyes glaze, posture pulls back, or they interrupt with 'Okay, but how does this look to the board?' (Social) or 'Just show me what happens Monday morning' (Physical).",
        counterMove:
          "Drop the spreadsheet immediately. Translate the exact same terms into their active Processing Filter: Social filter gets peer precedent and reputational upside; Physical filter gets tangible milestones and concrete artifacts; Emotional filter gets narrative impact and tension relief.",
        breakLine: "\"Skipping the model for a second—on Monday morning, your team gets a one-page dashboard and zero manual handoffs.\"",
      },
      {
        title: "Handling Extreme Internal-Locus Operators Without Triggering Reactance",
        setting: "Founder negotiations, senior technical leads, aggressive Achievers",
        signal:
          "Heavy agency language ('I built...', 'I decide...', 'Don't tell me what policy says'), visible irritation when told what they 'must' or 'have to' do.",
        counterMove:
          "Never box an Internal-Locus operator into a rule or mandate—they will blow up a profitable deal just to prove you don't control them. Hand them explicit decision ownership and frame constraints as objective trade-offs they get to choose between.",
        breakLine: "\"You have the final call on how you want to structure this—Option A protects speed at $X; Option B protects margin at $Y. Which trade-off do you want?\"",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Robert Cialdini (Influence — Authority & Social Proof)",
        insight:
          "Explains why External-Locus and Social-Filter counterparts respond disproportionately to precedent, institutional logos, and 'what peer firms already approved'—their risk model outsources verification to external consensus rather than first-principles math.",
      },
      {
        author: "Julian Rotter (Locus of Control Theory)",
        insight:
          "Hughes operationalizes Rotter's clinical construct into a live negotiation dial (-100 to +100). The key nuance Rotter adds: locus is domain-specific. A fearless founder (Internal locus in business) can flip to rigid External locus the moment tax law or immigration bureaucracy enters the room.",
      },
      {
        author: "William Torbert (Action Logics — Expert vs. Achiever vs. Diplomat)",
        insight:
          "Maps cleanly onto Hughes's filters: Experts default to Cognitive precision, Diplomats to Social/Emotional climate, and Achievers to Physical/measurable outcomes. Matching the filter lets you speak their dialect without surrendering your own center of gravity.",
      },
    ],
    operatorShadow: [
      {
        trap: "The Cognitive Default Bias",
        mechanism:
          "Because your own default analytical engine is high-resolution Cognitive, you instinctively assume that if someone disagrees, you just haven't explained the logic clearly enough—causing you to pile on more data while losing a Social or Physical decision-maker.",
        calibration: "Before your second paragraph of explanation, ask yourself: which of the 4 filters did their last two sentences actually use?",
      },
      {
        trap: "Treating Locus as a Character Flaw",
        mechanism:
          "Feeling quiet contempt for External-Locus bureaucrats or risk-averse managers, which leaks into your vocal edge and turns routine administrative approvals into turf wars.",
        calibration: "Treat External Locus as an incentive structure, not a personal weakness—solve their risk exposure and watch doors open.",
      },
    ],
    codexIds: ["PIT-04"],
  },

  M07: {
    moduleId: "M07",
    pitStage: "blue",
    status: "DEEPENED",
    operationalThesis:
      "The 6-Minute Profiling Loop is only as sharp as the diagnostic probes you drop into normal conversation. Live profiling fails when operators passively wait for clues—or when they treat a 3-minute impression as permanent fact instead of a falsifiable working hypothesis.",
    liveRoomCounterPlay: [
      {
        title: "Dropping Invisible Diagnostic Probes (Priority, Attribution, Authority)",
        setting: "First 5 minutes of discovery calls, job interviews, vendor scoping",
        signal:
          "Polite surface rapport where you still don't know who holds real veto power, what filter they use, or whether they own outcomes.",
        counterMove:
          "Weave one natural, low-friction probe into early conversation: (1) Priority Probe ('If timeline and scope collide this quarter, which breaks first?') to expose filter; (2) Attribution Probe ('What drove the slip on the last rollout?') to expose Internal vs. External locus; (3) Authority Probe ('How does a yes actually clear your side?') to expose ghost stakeholders.",
        breakLine: "\"Before we map deliverables, when the last vendor rollout hit friction, what actually caused the bottleneck?\"",
      },
      {
        title: "Spotting & Neutralizing Suggestibility Micro-Tests",
        setting: "Adversarial negotiations, high-pressure sales, tough interviews",
        signal:
          "Early, seemingly trivial compliance requests before real terms arise—e.g., asking you to move seats, switch meeting times last-minute, agree to a minor arbitrary framing, or accept a small unnegotiated 'standard' clause.",
        counterMove:
          "Recognize micro-tests as calibration probes measuring how easily you yield under light pressure. Never say yes automatically just to be polite. Hold one clean, relaxed boundary on a minor item early—it resets the counterpart's suggestibility score on you before the big numbers hit the table.",
        breakLine: "\"I'll stay on this side of the table—better light for my notes. Ready to jump into the terms?\"",
      },
      {
        title: "Enforcing the Disconfirmation Check",
        setting: "Mid-meeting pivots & multi-round negotiations",
        signal:
          "You profiled the counterpart as a rigid External-Locus bureaucrat in minute 3, but in minute 18 they casually offer a creative workaround off-script.",
        counterMove:
          "Update your model immediately. Ask yourself silently: 'What single behavior would prove my current profile wrong?' The moment disconfirming evidence appears, drop the old label and follow the live data.",
        breakLine: "Shift immediately from compliance-checklist framing to collaborative option-design.",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Chris Voss (Never Split the Difference — Calibrated Questions)",
        insight:
          "Voss's 'How' and 'What' calibrated questions are the cleanest delivery vehicle for Hughes's live-profiling probes: they force the counterpart to reveal their internal decision architecture, constraints, and locus without feeling interrogated.",
      },
      {
        author: "Philip Tetlock (Superforecasting — Bayesian Updating)",
        insight:
          "The difference between an elite profiler and an armchair typologist is Bayesian updating. Treat your minute-3 read as a 60% prior, run one probe to test it, and update your confidence up or down based on observable behavior—never ego.",
      },
      {
        author: "Robert Cialdini (Commitment & Consistency — Foot-in-the-Door)",
        insight:
          "Explains why Hughes's Suggestibility Micro-Tests matter defensively: small early concessions don't just test compliance—they actively manufacture it by triggering consistency pressure for larger asks later in the same room.",
      },
    ],
    operatorShadow: [
      {
        trap: "Premature Typing & Label Lock",
        mechanism:
          "Enjoying the clarity of boxing someone into a clean profile ('Cognitive / External / Significance') so much that you stop noticing when their state shifts under pressure.",
        calibration: "Profiles describe current operating posture in a specific room—never a fixed personality essence.",
      },
      {
        trap: "Interrogation Cadence",
        mechanism:
          "Stacking two or three diagnostic probes back-to-back without offering any framing or reciprocity, which triggers defensive guarding.",
        calibration: "One probe, followed by genuine listening and a brief summary—never rapid-fire questioning.",
      },
    ],
    codexIds: ["PIT-11", "PIT-04"],
  },

  M08: {
    moduleId: "M08",
    pitStage: "blue",
    status: "DEEPENED",
    operationalThesis:
      "Elicitation does not defeat you by force; it defeats you by hijacking your own politeness, competence pride, and precision reflexes. The highest-yield elicitation weapon in professional rooms is the Correction Trigger—planting a casual, slightly wrong statement so you rush to fix it and leak guarded leverage.",
    liveRoomCounterPlay: [
      {
        title: "Defeating the Correction Trigger (Deliberate Misstatement)",
        setting: "Compensation talks, vendor discovery, competitive interviews, HR/legal reviews",
        signal:
          "Counterpart casually drops a slightly inaccurate assumption about your numbers, timeline, alternatives, or internal capacity ('So you guys probably have three weeks of slack built into Q4 anyway,' or 'I imagine your current role is capped around $X').",
        counterMove:
          "Catch the automatic surge to correct them. Pause one full breath and ask: 'Does letting this inaccurate side comment sit uncorrected actually bind me legally or financially?' If not, let it pass untouched—or deliver a flat, narrow boundary sentence that reveals zero internal data.",
        breakLine: "\"Our delivery window is tied to the signed schedule—nothing outside that is on the table.\"",
      },
      {
        title: "Neutralizing Bracketing & False-Consensus Traps",
        setting: "Pricing discovery, salary negotiation, procurement bidding",
        signal:
          "Counterpart throws out an absurdly low or high range ('Most consultants we see for this are around $40k–$50k, right?') or claims 'everyone in the market shares their rate card upfront' to force you to reveal your true floor or BATNA.",
        counterMove:
          "Refuse to react emotionally to the low bracket or prove you aren't overpriced by justifying your cost structure. Deflect the bracket neutrally and pivot straight back to scope and value drivers.",
        breakLine: "\"Market rates vary wildly depending on scope and risk. Once we lock the exact deliverables, I'll send a clean fixed quote.\"",
      },
      {
        title: "Surviving the Silence Vacuum & Sympathetic Venting",
        setting: "Interviews, debriefs, colleague/manager fishing expeditions",
        signal:
          "Counterpart asks an open question, gets your clean two-sentence answer, and then just nods slowly and waits in silence—or shares a fake minor complaint ('Honestly, leadership is a mess here too, right?') to induce reciprocal venting.",
        counterMove:
          "Hold the silence back. Once you have answered the narrow question asked, close your mouth, keep relaxed eye contact, and let the quiet sit. Against sympathetic venting, validate neutrally without contributing a single quotable criticism or internal secret.",
        breakLine: "Deliver your two-sentence answer, drop terminal pitch, and wait calmly until they speak next.",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "FBI / Intelligence Elicitation Doctrine (Standard Counter-Elicitation)",
        insight:
          "Hughes's elicitation chapter adapts classic intelligence tradecraft (deliberate misstatement, flattery, assumed knowledge, quid pro quo). Intelligence counter-training teaches one iron rule: information leaks happen in the second and third sentences of an answer, almost never the first.",
      },
      {
        author: "Jim Camp (Start with No — Eradicating Neediness)",
        insight:
          "Neediness is the fuel behind elicitation vulnerability. When you feel you need the counterpart to like you, believe you, or approve of you, you over-explain and fill every silence vacuum. Emotional detachment makes narrow answering effortless.",
      },
      {
        author: "Robert Greene (The 48 Laws of Power — Law 4: Always Say Less Than Necessary)",
        insight:
          "Every extra clause you volunteer under elicitation pressure gives the other side free leverage, unintended commitments, or fresh hooks for follow-up probes. Economy of speech is both an authority signal and an information firewall.",
      },
    ],
    operatorShadow: [
      {
        trap: "The Interpreter's & Expert's Precision Reflex",
        mechanism:
          "Years of training to preserve exact fidelity and fix every factual or linguistic inaccuracy make you unusually susceptible to the Correction Trigger. Leaving a wrong number hanging in the air feels physically uncomfortable—and skilled elicitors exploit that exact discomfort.",
        calibration: "Practice letting non-material inaccuracies pass completely uncorrected in low-stakes rooms until your nervous system stops flinching.",
      },
      {
        trap: "Over-Defensiveness (Looking Secretive Instead of Calm)",
        mechanism:
          "Snapping 'I can't disclose that' or turning visibly guarded when probed—which instantly signals that you are hiding high-value leverage right where they poked.",
        calibration: "Keep narrow answers warm, breezy, and matter-of-fact; boredom kills elicitation faster than stonewalling.",
      },
    ],
    codexIds: ["PIT-03", "PIT-11"],
  },

  M09: {
    moduleId: "M09",
    pitStage: "brown",
    status: "DEEPENED",
    operationalThesis:
      "Linguistic harvesting and embedded commands do not operate by hypnosis magic; they operate by lowering cognitive friction. When an operator feeds back your exact sensory hot-words inside rhythmically paced clauses—and marks an action verb with a slight pause or tonal drop—your brain treats the directive as native to your own internal monologue.",
    liveRoomCounterPlay: [
      {
        title: "Neutralizing Linguistic Harvesting (Hot-Word Echoes)",
        setting: "High-stakes vendor pitches, recruiting closes, executive persuasion",
        signal:
          "You casually mention two or three emotionally loaded words ('clean handoff,' 'zero friction,' 'locked in'), and ten minutes later the counterpart weaves those exact phrases back verbatim right before asking for an aggressive commitment or fee concession.",
        counterMove:
          "Recognize the warm 'they really get me' feeling as an engineered familiarity effect, not proof that the terms are good. Strip the emotional adjectives out of the room by translating their pitch back into dry, concrete operational nouns on paper.",
        breakLine: "\"Putting 'zero friction' aside for a minute—what is the exact SLA penalty if Phase 1 slips by five business days?\"",
      },
      {
        title: "Disrupting Embedded Commands & Analog Marking",
        setting: "Closing calls, live presentations, contract walk-throughs",
        signal:
          "A tentative, non-committal wrapper clause housing a clean imperative verb delivered with a subtle pause, lower pitch, or hand gesture ('I don't know if your team is ready to [sign the addendum today] or if you want to [keep spinning wheels] until Q1...').",
        counterMove:
          "Refuse to absorb the cadence. Break the rhythmic flow physically and verbally—pause, look down at your notes (severing visual/tonal synchronization), and restate your actual evaluation standard in flat, explicit syntax.",
        breakLine: "\"We're not signing today. Let's walk through the three open redlines so legal can review them tomorrow.\"",
      },
      {
        title: "Auditing Sensory-Channel Priming Before Numbers Land",
        setting: "Fee anchoring, performance reviews, partnership pitches",
        signal:
          "Counterpart spends five minutes painting vivid imagery of risk, chaos, or missed opportunity ('picture how painful a Q3 outage looks to leadership') immediately before proposing an overpriced or one-sided fix.",
        counterMove:
          "Name the shift from imagery to numbers. Separate the risk scenario from their proposed pricing so emotional salience does not distort your baseline math.",
        breakLine: "\"We agree downtime is expensive. Now let's evaluate this fee strictly against the market benchmark for these deliverables.\"",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Robert Cialdini (Pre-Suasion — Associative Priming & Attentional Channels)",
        insight:
          "Provides the empirical backbone beneath Hughes's linguistic harvesting: words and metaphors spoken in the opening minutes activate associative networks that bias how the listener scores the offer five minutes later. The counter-move is identical—force an explicit shift to objective written criteria.",
      },
      {
        author: "Daniel Kahneman (Cognitive Ease & Processing Fluency)",
        insight:
          "Explains why harvested vocabulary lowers skepticism: when a sentence uses your own words and cadence, your brain experiences high processing fluency—and System 1 routinely mistakes fluency ('this sounds familiar and smooth') for truth ('this deal is safe').",
      },
      {
        author: "Deborah Tannen (That's Not What I Meant — Conversational Style & Metamessage)",
        insight:
          "While Tannen analyzes natural pacing and word echoing as bonding signals, The Pit tracks the exact inflection point where intentional mirroring flips from rapport into covert steering.",
      },
    ],
    operatorShadow: [
      {
        trap: "Slick Over-Steering (The Velvet Trap)",
        mechanism:
          "Because you pick up a counterpart's exact lexicon and metaphors rapidly, it is tempting to echo their hot-words and nest subtle directives to shortcut a slow, messy negotiation.",
        calibration: "Short-term verbal compliance won via covert syntax frequently collapses into buyer's remorse or passive-aggressive implementation sabotage.",
      },
      {
        trap: "Paranoid Word-Policing",
        mechanism:
          "Treating every natural repetition of your vocabulary as a covert hypnotic attack—turning normal collaborative mirroring into suspicion.",
        calibration: "Only flag linguistic harvesting when verbatim hot-word echoing is paired directly with a premature or asymmetric ask.",
      },
    ],
    codexIds: ["PIT-05", "PIT-07"],
  },

  M10: {
    moduleId: "M10",
    pitStage: "brown",
    status: "DEEPENED",
    operationalThesis:
      "Presuppositions and double binds win by shifting the battlefield off the core decision ('whether') onto logistics ('when, how, or which'). The instant you answer inside the grammar of a rigged question, you have silently ratified its unstated premise without ever saying yes.",
    liveRoomCounterPlay: [
      {
        title: "Exposing & Dismantling Presuppositions ('When/How/Which' Traps)",
        setting: "Scope expansions, timeline pushes, vendor renewals, bureaucratic intake",
        signal:
          "An unagreed premise smuggled inside a logistical question ('Once we move the launch to Friday, how does QA adjust?' or 'Which of your analysts will take on the extra compliance audit?').",
        counterMove:
          "Never answer the logistical half of the sentence. Stop at the verb, pull the hidden premise out into the open in one flat, non-accusatory sentence, and force an explicit decision on 'whether' before touching 'how.'",
        breakLine: "\"Before we talk about QA, we haven't agreed to move the launch to Friday. Let's decide whether the date moves at all.\"",
      },
      {
        title: "Stepping Outside Double Binds (False Binaries)",
        setting: "Closing calls, exploding offers, scheduling pressure",
        signal:
          "Two options presented as the entire universe, where both options advance the speaker's objective ('Do you want to lock in the 12-month contract before noon or at 4 PM today?' or 'Do you want to absorb the Rush Fee or cut testing?').",
        counterMove:
          "Reject the binary cleanly without getting defensive or arguing which of their two bad options is worse. Introduce Option C—your actual terms—on a calm downward inflection.",
        breakLine: "\"Neither works. We're keeping full testing and the agreed rate; if we need speed, we adjust the Phase 2 launch date.\"",
      },
      {
        title: "Deploying the 'Right to Veto' Against Compliance Escalation",
        setting: "High-pressure sales or stakeholder consensus rooms",
        signal:
          "A rapid stack of small 'yes-set' questions ('You want Q4 to run smoothly, right? And you want clean audit trails, right?') building momentum toward a hard close.",
        counterMove:
          "Break the yes-momentum deliberately with a calm 'No' or conditional pivot. Reclaiming your right to say no resets the room's psychological gravity immediately.",
        breakLine: "\"We want clean audits, yes—and no, this package isn't the way we're going to get there.\"",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Jim Camp (Start with No — The Right to Veto)",
        insight:
          "Camp's core principle is the cleanest antidote to Hughes's compliance ladders and double binds: explicitly preserving both sides' right to say 'No' destroys artificial momentum and keeps decision-making grounded in objective reality.",
      },
      {
        author: "Chris Voss (Never Split the Difference — 'No'-Oriented Questions)",
        insight:
          "Voss notes that 'Yes' triggers defensive vigilance in experienced negotiators, whereas 'No' restores autonomy. When someone tries to trap you in a 'yes-set' or double bind, answering with a calm, unbothered 'No' immediately flips leverage back to your side of the table.",
      },
      {
        author: "Jack Brehm (Psychological Reactance Theory)",
        insight:
          "Explains the exact blowback risk of deploying double binds offensively: the moment a high-autonomy counterpart detects that their freedom of choice is being narrowed into a rigged binary, reactance fires—causing them to reject even a profitable deal just to restore autonomy.",
      },
    ],
    operatorShadow: [
      {
        trap: "Impatient Binary Closings",
        mechanism:
          "When dealing with slow committees or indecisive peers, it is tempting to drop a slick presupposition or double bind just to force movement.",
        calibration: "Use binary choices strictly *after* the underlying premise has been explicitly consented to—otherwise you trade 5 minutes of speed for weeks of resentment.",
      },
      {
        trap: "Politeness-Driven Premise Acceptance",
        mechanism:
          "Answering a presupposition politely ('Well, if we moved it to Friday, QA would struggle...') to avoid sounding blunt—accidentally entering negotiation over a concession you never intended to grant.",
        calibration: "Never negotiate hypotheticals inside an unagreed premise; kill the premise in sentence one.",
      },
    ],
    codexIds: ["PIT-06"],
  },

  M11: {
    moduleId: "M11",
    pitStage: "black",
    status: "DEEPENED",
    operationalThesis:
      "In real negotiations, interviews, and institutional rooms, 'conversational trance' has nothing to do with stage hypnosis—it is engineered cognitive tunneling caused by stacked complexity, marathon fatigue, abrupt tempo breaks, and attentional overload that temporarily shuts down System 2 scrutiny.",
    liveRoomCounterPlay: [
      {
        title: "Forcing Serialization Against Stacked-Question Overload",
        setting: "Adversarial panel interviews, aggressive procurement calls, legal/audit questioning",
        signal:
          "Counterpart fires three or four bundled questions, numbers, and caveats in a single rapid breath—overloading working memory so you drop critical guardrails while trying to track all four.",
        counterMove:
          "Refuse to answer a compound stack in one pass. Halt the tempo physically (set your pen down or raise a calm open palm), explicitly count the items out loud, and force serialization one discrete item at a time.",
        breakLine: "\"That's three separate points—pricing, indemnification, and timeline. Let's settle pricing first, then move to the next two.\"",
      },
      {
        title: "Breaking Abrupt Pattern Interrupts & Emotional Whiplash",
        setting: "High-pressure bargaining, 'good cop / bad cop' rooms",
        signal:
          "Sudden, jarring shift in tone, volume, or subject (e.g., cordial rapport snapping into abrupt urgency or mild confusion) immediately followed by a direct request for a signature or verbal concession.",
        counterMove:
          "Recognize the pattern break as an autopilot-disengagement window designed to slip a demand past your guard while your brain re-orients. Do not respond inside the 3-second re-orientation window. Take a slow breath, glance at your written notes, and anchor back to your pre-set agenda.",
        breakLine: "\"Hold on—we just jumped from Phase 1 deliverables to a full-year lock-in. Let's finish Phase 1 before opening annual terms.\"",
      },
      {
        title: "Enforcing the 90-Minute Fatigue Firewall",
        setting: "Marathon contract negotiations, multi-hour settlement or deal sessions",
        signal:
          "Late in a long session (past 75–90 minutes), counterparts suddenly introduce 'one last minor cleanup clause' or push to 'wrap this up tonight while everyone is in the room.'",
        counterMove:
          "Treat late-session 'minor' clauses as maximum-risk zones. Cognitive depletion makes bad terms look reasonable just to stop the mental friction. Enforce a hard personal rule: never make a new financial or binding commitment inside a fatigue window.",
        breakLine: "\"We've covered solid ground for two hours. Send that final redline in writing and I'll review it fresh at 9 AM.\"",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Roy Baumeister & Daniel Kahneman (Ego Depletion / Cognitive Load Tunneling)",
        insight:
          "Strips away the mystique of Hughes's trance chapters: sustained attention, ambiguity, and rapid decision-making exhaust executive control. When working memory saturates, humans default to the path of least resistance—accepting the frame handed to them.",
      },
      {
        author: "Milton Erickson (Pattern Interrupts & Utilization)",
        insight:
          "Hughes borrows Erickson's interrupt mechanics directly. Understanding that an interrupt only opens a brief 2-to-5-second attentional window makes the defense simple: any deliberate physical pause (sipping water, checking notes, exhaling) closes the window before a directive lands.",
      },
      {
        author: "Cal Newport & Nir Eyal (Attentional Sovereignty)",
        insight:
          "In modern rooms, overload isn't just verbal—it is notifications, dual screens, rapid slide decks, and tight back-to-back calendars. Controlling your own sensory bandwidth is a prerequisite for resisting engineered confusion.",
      },
    ],
    operatorShadow: [
      {
        trap: "Confusing Mental Fatigue With Momentum",
        mechanism:
          "Feeling a sudden urge late in a negotiation to 'just get it done' and conceding a small point that carries major downstream cost.",
        calibration: "Whenever you hear yourself thinking 'I just want this meeting over,' your scrutiny is offline—call a pause immediately.",
      },
      {
        trap: "Using Jargon Overload as a Defensive Shield",
        mechanism:
          "Flooding a counterpart with dense technical or financial complexity to confuse them into backing down—which stalls deals with cautious buyers who default to 'No' when confused.",
        calibration: "Clarity closes good deals; overload only works in short-term adversarial traps.",
      },
    ],
    codexIds: ["PIT-12", "PIT-07"],
  },

  M12: {
    moduleId: "M12",
    pitStage: "black",
    status: "DEEPENED",
    operationalThesis:
      "Coercive compliance rarely arrives as a single isolated trick—it runs as an engineered 7-step pipeline (Approach → Autopilot Disengage → Authority → Profile & Pace → Linguistic Control → Trance/Urgency → Call to Action) amplified by physical seating, sightlines, and time compression. Waiting until Step 7 to resist is expensive; elite operators break the chain at Steps 2–4.",
    liveRoomCounterPlay: [
      {
        title: "Executing Early Chain-Breaks (Steps 2–4 Interception)",
        setting: "High-stakes adversarial negotiations, tough vendor rooms, rigged committees",
        signal:
          "You spot the early links stacking in sequence: abrupt opening pattern break (Step 2) → heavy status/authority theater (Step 3) → rapid pacing/mirroring and diagnostic probing (Step 4).",
        counterMove:
          "Do not wait for the exploding offer at Step 7. Break the chain while momentum is still weak: (1) At Step 2, refuse the rushed tempo with a calm 2-second pause; (2) At Step 3, treat heavy authority theater with relaxed peer stillness; (3) At Step 4, hold one minor boundary to fail their suggestibility test. Once Steps 2–4 fracture, Steps 5–7 lose their footing.",
        breakLine: "\"Before we jump into the terms, let's align on the agenda and how much time we actually need to cover this properly.\"",
      },
      {
        title: "Neutralizing Spatial, Proxemic & Camera Engineering",
        setting: "Conference rooms, administrative offices, video negotiations",
        signal:
          "Lower or cramped visitor chair facing backlighting/glare, blocked sightline to the door, a counterpart standing over a seated table, or a low/unflattering camera angle on video paired with a ticking clock.",
        counterMove:
          "Reclaim spatial parity casually and without drama. Shift your chair angle slightly to open your sightline, adjust your laptop height so lens level matches eye level, or stand up briefly to grab water/notes if someone tries to hover over you. Never let physical discomfort quietly compress your patience.",
        breakLine: "\"Mind if I shift over one seat? The window glare hits right across my notes.\"",
      },
      {
        title: "Deploying the Zero-Reason No-Sell & Clean Walk-Away",
        setting: "Exploding offers, bad-faith rooms, artificial scarcity deadlines",
        signal:
          "Step 7 Call to Action arrives wrapped in artificial time compression ('This offer expires at 5 PM today' or 'We have another candidate waiting on the line').",
        counterMove:
          "Recognize manufactured urgency as the final lock on the compliance chain. Drop the rope completely: give zero defensive justification (reasons invite counter-arguments), state your non-negotiable review timeline once on a downward pitch, and be genuinely willing to walk away.",
        breakLine: "\"I don't make binding commitments on same-day deadlines. If the terms are still open tomorrow at 10 AM, we can pick it up then.\"",
      },
    ],
    crossCorpusSynthesis: [
      {
        author: "Jeffrey Pfeffer (Power — Structural & Exit Leverage)",
        insight:
          "Pfeffer's structural view completes Hughes's psychological pipeline: tactical counter-moves only hold real teeth when backed by a credible exit option (BATNA). The calmest voice at Step 7 belongs to the person who does not need the deal.",
      },
      {
        author: "Edward T. Hall (The Hidden Dimension — Proxemics & Territoriality)",
        insight:
          "Grounds Hughes's environmental engineering in empirical spatial anthropology: seat elevation, table distance, and exit-path blocking silently alter cortisol and deference levels long before a word is spoken.",
      },
      {
        author: "Erving Goffman (Frame Analysis — Breaking the Stage)",
        insight:
          "Every compliance sequence is a staged theatrical frame. By calmly adjusting your chair, slowing the tempo, or naming an exploding deadline aloud, you step off the counterpart's stage and force the interaction back onto neutral ground.",
      },
    ],
    operatorShadow: [
      {
        trap: "Ego-Driven Counter-Manipulation (Staying in a Rigged Room)",
        mechanism:
          "Spotting a textbook 7-step compliance sequence and staying in a bad-faith room just for the intellectual thrill of outplaying the other operator.",
        calibration: "The highest Black-Belt skill is recognizing a bad-faith room early and walking out with your time and leverage intact.",
      },
      {
        trap: "Over-Engineering Collaborative Rooms",
        mechanism:
          "Bringing adversarial room-control tactics (seating dominance, artificial deadlines, rapid-fire pacing) into long-term partnerships or team settings where trust is the primary asset.",
        calibration: "Match the instrument to the room: asymmetric counter-play is for asymmetric pressure, never for building durable alliances.",
      },
    ],
    codexIds: ["PIT-08", "PIT-13"],
  },
};

export const INITIAL_PIT_CODEX = [
  {
    id: "PIT-01",
    name: "Authority Killers & Status Leakage",
    stage: "white",
    range: "mild",
    sixFields: {
      context: "Opening minutes of interviews, negotiations, or bureaucratic windows.",
      harm: "Rapid nodding, vocal uptalk, fidgeting, and filling silence crack demeanor and invite harder anchoring.",
      remedy: "Hold physical stillness, drop terminal vocal pitch, and absorb 2–3 seconds of silence.",
      ethicalUse: "Projecting grounded, unhurried composure without theatrical dominance.",
      yourTemptation: "Over-explaining or nodding quickly to signal comprehension and precision.",
    },
  },
  {
    id: "PIT-02",
    name: "123-Cell DRS Cluster Spike (11+ Threshold)",
    stage: "white",
    range: "moderate",
    sixFields: {
      context: "Targeted questioning or high-stakes contract clauses.",
      harm: "Over-reading single gestures or cognitive load creates false-positive paranoia.",
      remedy: "Score only multi-cue shifts from verified baseline within 30s; treat 11+ as a focus flag, not a verdict.",
      ethicalUse: "Spotting friction points so you ask one cleaner diagnostic question.",
      yourTemptation: "Treating a sharp behavioral read as courtroom certainty.",
    },
  },
  {
    id: "PIT-03",
    name: "The Correction Trigger (Deliberate Misstatement)",
    stage: "blue",
    range: "moderate",
    sixFields: {
      context: "Elicitation probes planting wrong numbers, flawed summaries, or ego-baits.",
      harm: "Triggers an automatic reflex to correct the record and leak guarded leverage.",
      remedy: "Pause 1 breath, answer narrowly, or let non-material errors pass unchallenged.",
      ethicalUse: "Openly checking shared understanding without entrapment.",
      yourTemptation: "Correcting every factual or linguistic imprecision immediately.",
    },
  },
  {
    id: "PIT-04",
    name: "Locus & Processing-Filter Mismatch",
    stage: "blue",
    range: "mild",
    sixFields: {
      context: "Pitching terms or navigating compliance/bureaucratic desks.",
      harm: "Using internal-agency logic on an external-locus gatekeeper stalls approval.",
      remedy: "Diagnose dominant filter + locus in the first 90 seconds and match evidence format.",
      ethicalUse: "Framing proposals in the listener's clearest comprehension channel.",
      yourTemptation: "Defaulting to dense Cognitive analysis regardless of the audience.",
    },
  },
  {
    id: "PIT-05",
    name: "Embedded Commands",
    stage: "brown",
    range: "moderate",
    sixFields: {
      context: "Persuasive pitches nesting action directives inside casual clauses.",
      harm: "Nudges compliance beneath deliberate scrutiny.",
      remedy: "Break vocal rhythm and restate your own decision criteria in plain nouns.",
      ethicalUse: "Giving clear, direct proposals openly.",
      yourTemptation: "Nesting directives inside smooth, diplomatic phrasing.",
    },
  },
  {
    id: "PIT-06",
    name: "Presuppositions & Double Binds",
    stage: "brown",
    range: "moderate",
    sixFields: {
      context: "Closing questions or binary choices baking in an unagreed premise.",
      harm: "Funnels either answer toward premature commitment.",
      remedy: "Name the hidden premise aloud or step outside both binary options.",
      ethicalUse: "Offering two genuinely consented options after alignment.",
      yourTemptation: "Using 'when/how' presuppositions to shortcut slow debate.",
    },
  },
  {
    id: "PIT-07",
    name: "Linguistic Harvesting & Pacing/Overload Shifts",
    stage: "brown",
    range: "moderate",
    sixFields: {
      context: "Mirroring sensory hot-words paired with rapid tempo or multi-part overload.",
      harm: "Shifts attention from critical evaluation into hurried compliance.",
      remedy: "Serialize questions one by one and evaluate terms against written specs.",
      ethicalUse: "Moderate pacing to build natural conversational flow.",
      yourTemptation: "Harvesting a counterpart's hot-words to steer outcomes.",
    },
  },
  {
    id: "PIT-08",
    name: "7-Step Compliance Sequence & Room Engineering",
    stage: "black",
    range: "severe",
    sixFields: {
      context: "Combining seating/proxemics, pattern break, authority, pacing, syntax, and urgency.",
      harm: "Compresses judgment and forces hurried commitment.",
      remedy: "Break the chain at steps 2–4 or execute a zero-reason walk-away.",
      ethicalUse: "Designing a clear, low-friction meeting structure.",
      yourTemptation: "Orchestrating room/timing leverage or trying to out-manipulate a bad-faith room.",
    },
  },
  {
    id: "PIT-09",
    name: "Micro-Contempt & Motor Lip Inhibition",
    stage: "white",
    range: "moderate",
    sixFields: {
      context: "Senior stakeholder reviews, fee anchoring, and adversarial interviews.",
      harm: "Unilateral lip raises assert covert status dominance; lip compression hides deal-killing objections behind a polite 'fine.'",
      remedy: "Never lecture against contempt—hand back a peer-level diagnostic question; surface lip compression neutrally without guessing the motive.",
      ethicalUse: "Spotting unspoken identity or structural friction early so you can address it cleanly.",
      yourTemptation: "Counter-lecturing with credentials when dismissed, or mind-reading the withheld objection.",
    },
  },
  {
    id: "PIT-10",
    name: "Social-Need Hooks (Intelligence Flattery & Pity Subsidy)",
    stage: "blue",
    range: "moderate",
    sixFields: {
      context: "Scope creep, uncompensated favors, and deadline pushback.",
      harm: "Timed flattery hooks intellect pride to drop critical scrutiny; Pity framing pressures you into subsidizing someone else's operational deficit.",
      remedy: "Accept praise in two dry words and sever it from the ask; acknowledge hardship once without moving your contract terms.",
      ethicalUse: "Recognizing genuine competence or constraints transparently with zero attached leverage play.",
      yourTemptation: "Over-delivering to live up to an intellectual compliment, or rescuing a stressed counterpart at your own expense.",
    },
  },
  {
    id: "PIT-11",
    name: "Suggestibility Micro-Tests & Bracketing Probes",
    stage: "blue",
    range: "mild",
    sixFields: {
      context: "Opening minutes of negotiations, seating/scheduling shifts, and early rate discovery.",
      harm: "Trivial early concessions calibrate you as compliant and trigger consistency pressure; extreme brackets bait you into revealing your true floor.",
      remedy: "Hold one relaxed, low-stakes boundary early to reset suggestibility; deflect extreme brackets back to concrete deliverables.",
      ethicalUse: "Testing mutual logistics and clarifying real market ranges openly.",
      yourTemptation: "Saying yes to minor inconveniences to appear cooperative, or justifying your rate against an absurdly low anchor.",
    },
  },
  {
    id: "PIT-12",
    name: "Cognitive Overload & Marathon Fatigue Windows",
    stage: "black",
    range: "moderate",
    sixFields: {
      context: "Rapid-fire compound questions, multi-hour bargaining sessions, and 'one last minor clause' at minute 90.",
      harm: "Depletes System 2 executive control so unfavorable terms feel acceptable just to close mental friction.",
      remedy: "Force serialization (one point at a time) and enforce a hard 90-minute no-new-commitments firewall.",
      ethicalUse: "Pacing complex agreements with scheduled breaks and written summaries.",
      yourTemptation: "Pushing through exhaustion to close a deal in one sitting, or using dense jargon to wear down pushback.",
    },
  },
  {
    id: "PIT-13",
    name: "Proxemic Tilting & Artificial Urgency",
    stage: "black",
    range: "severe",
    sixFields: {
      context: "Rigged conference seating, backlighting/glare, standing-over-seated posture, and exploding same-day deadlines.",
      harm: "Induces subtle autonomic discomfort and compresses deliberation time to force premature sign-off.",
      remedy: "Reclaim spatial parity casually (shift chair/camera angle) and deploy a zero-reason walk-away against artificial deadlines.",
      ethicalUse: "Setting comfortable, equal-footing room geometry and honest external deadlines.",
      yourTemptation: "Using artificial scarcity or seating geometry to tilt leverage in a competitive room.",
    },
  },
];
