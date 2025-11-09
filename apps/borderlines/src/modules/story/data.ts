export type StoryCategory = 'law' | 'personal';

export type Story = {
  id: string;
  title: string;
  subtitle: string;
  category: StoryCategory;
  daysAgo: number;
  likes: number;
  countryTag?: string;
  routeTag?: string;
  summary: string;
  keyDetails: string;
  meaning: string;
  images?: string[];
  isSpotlight?: boolean;
};

export const STORIES: Story[] = [
  {
    id: '1',
    title: 'UK Home Office announces changes to Skilled Worker salary thresholds',
    subtitle: 'UK Home Office',
    category: 'law',
    daysAgo: 1,
    likes: 22.3,
    countryTag: 'UK',
    routeTag: 'Skilled Worker',
    summary:
      'A plain-English breakdown of the new Skilled Worker salary thresholds and who is most affected by the change.',
    keyDetails:
      'Applies mainly to new Skilled Worker applications submitted after the change. Existing visas may be covered by transitional rules. Salary bands now vary more by occupation and region.',
    meaning:
      'If you are close to the salary threshold, check the updated guidance and consider speaking with a regulated adviser before you submit or vary an application.',
    images: [
      'https://images.pexels.com/photos/4386373/pexels-photo-4386373.jpeg',
      'https://images.pexels.com/photos/7731368/pexels-photo-7731368.jpeg',
    ],
    isSpotlight: true,
  },
  {
    id: '2',
    title: 'How my spouse visa appeal was finally allowed after 3 years',
    subtitle: 'Amina · Community Story',
    category: 'personal',
    daysAgo: 3,
    likes: 18.7,
    countryTag: 'UK',
    routeTag: 'Spouse Visa Appeal',
    summary:
      'Amina shares how an initial spouse visa refusal eventually became an allowed appeal after years of uncertainty.',
    keyDetails:
      'Two refusals, one fresh application, and a final appeal hearing. Updated evidence, medical records, and detailed witness statements were critical in showing the real impact on family life.',
    meaning:
      'Not every case will need an appeal, but keeping documents, asking for help early, and understanding what the tribunal looks for can change the outcome.',
    images: ['https://images.pexels.com/photos/4475925/pexels-photo-4475925.jpeg'],
    isSpotlight: true,
  },
  {
    id: '3',
    title: 'Canada updates Express Entry draws for healthcare professionals',
    subtitle: 'Immigration, Refugees and Citizenship Canada',
    category: 'law',
    daysAgo: 2,
    likes: 15.4,
    countryTag: 'Canada',
    routeTag: 'Express Entry',
    summary:
      'Recent Express Entry rounds are targeting specific healthcare occupations with adjusted cut-off scores.',
    keyDetails:
      'Certain NOC codes are now prioritised, and some draws have lower CRS scores than general rounds. Candidates still need to meet all core eligibility requirements.',
    meaning:
      'If you work in healthcare, this could open a faster route, but you should still prepare language tests, credential assessments, and proof of experience early.',
    images: [
      'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
      'https://images.pexels.com/photos/3957989/pexels-photo-3957989.jpeg',
    ],
  },
  {
    id: '4',
    title: 'From overstayer to status under the 20-year rule',
    subtitle: 'Marco · Lived Experience',
    category: 'personal',
    daysAgo: 5,
    likes: 19.1,
    countryTag: 'UK',
    routeTag: '20-year rule',
    summary:
      'Marco explains how decades of living in the UK without status eventually led to limited leave under the long-residence rules.',
    keyDetails:
      'Evidence of continuous residence, community links, and honest disclosure of past history all played a part. The process was slow, with several requests for further information.',
    meaning:
      'Long-residence routes can provide a way forward, but they are emotionally and financially heavy. Getting clear advice and building evidence over time is essential.',
    images: ['https://images.pexels.com/photos/2386224/pexels-photo-2386224.jpeg'],
  },
  {
    id: '5',
    title: 'New Zealand adjusts Accredited Employer wage bands',
    subtitle: 'Immigration New Zealand',
    category: 'law',
    daysAgo: 4,
    likes: 12.8,
    countryTag: 'New Zealand',
    routeTag: 'Accredited Employer Work Visa',
    summary:
      'Overview of the updated wage thresholds for companies hiring on the accredited route.',
    keyDetails:
      'Benchmark wage now ties to median income updates, sector agreements keep transitional settings, and compliance audits will tighten.',
    meaning:
      'Employers should confirm salary mapping before job checks and workers need to evidence pay matching the new band.',
    images: ['https://picsum.photos/seed/story5/800/600'],
    isSpotlight: true,
  },
  {
    id: '6',
    title: 'From graduate visa to startup founder in Berlin',
    subtitle: 'Mateo · Community Story',
    category: 'personal',
    daysAgo: 7,
    likes: 14.6,
    countryTag: 'Germany',
    routeTag: 'Startup Residence',
    summary:
      'Mateo explains the shift from a graduate job search visa into the startup founder permit.',
    keyDetails:
      'Pitch deck, proof of funding, and regional chamber endorsement were required. Legal support handled shareholder agreements.',
    meaning:
      'Early budgeting for legal fees and documenting traction helped convince the economic authority that the business is viable.',
    images: ['https://picsum.photos/seed/story6/800/600'],
  },
  {
    id: '7',
    title: 'Australia prioritises partner visa backlog with new triage',
    subtitle: 'Department of Home Affairs',
    category: 'law',
    daysAgo: 2,
    likes: 16.5,
    countryTag: 'Australia',
    routeTag: 'Partner Visa',
    summary:
      'A new triage model targets long-pending partner visa files lodged offshore.',
    keyDetails:
      'Files older than 18 months move to dedicated officers, relationship evidence checklists were simplified, and medicals can be deferred until decision.',
    meaning:
      'Applicants should upload a single consolidated relationship timeline and respond quickly to document requests to stay in priority lanes.',
    images: ['https://picsum.photos/seed/story7/800/600'],
    isSpotlight: true,
  },
  {
    id: '8',
    title: 'Securing humanitarian parole for my parents during medical emergency',
    subtitle: 'Lina · Community Story',
    category: 'personal',
    daysAgo: 9,
    likes: 11.2,
    countryTag: 'United States',
    routeTag: 'Humanitarian Parole',
    summary:
      'Lina outlines the evidence used to bring her parents to the US while coordinating urgent medical care.',
    keyDetails:
      'Hospital letters, financial support affidavits, and proof of temporary housing were bundled with translated records.',
    meaning:
      'Having a doctor outline treatment timelines and arranging travel insurance helped USCIS understand the urgency.',
    images: ['https://picsum.photos/seed/story8/800/600'],
  },
  {
    id: '9',
    title: 'Spain clarifies digital nomad income thresholds for dependants',
    subtitle: 'Ministry of Economic Affairs and Digital Transformation',
    category: 'law',
    daysAgo: 6,
    likes: 10.4,
    countryTag: 'Spain',
    routeTag: 'Digital Nomad Visa',
    summary:
      'The ministry confirmed how minimum income scales when nomad visa holders bring family members.',
    keyDetails:
      'Primary applicants need 200 percent of the minimum wage, partners add 75 percent, and each child adds 25 percent.',
    meaning:
      'Families should gather contracts and bank statements showing stable remote income before lodging applications at consulates.',
    images: ['https://picsum.photos/seed/story9/800/600'],
  },
  {
    id: '10',
    title: 'Quebec spousal sponsorship approval after unexpected layoff',
    subtitle: 'Andrei · Community Story',
    category: 'personal',
    daysAgo: 12,
    likes: 9.9,
    countryTag: 'Canada',
    routeTag: 'Spousal Sponsorship',
    summary:
      'Andrei details how a sudden layoff almost derailed his inland sponsorship.',
    keyDetails:
      'Updated employment plan, savings statements, and a letter explaining job search kept the file active.',
    meaning:
      'Honesty with IRCC and showing a realistic budget helped officers feel the couple still met financial expectations.',
    images: ['https://picsum.photos/seed/story10/800/600'],
  },
  {
    id: '11',
    title: 'Ireland streamlines Stamp 4 renewals with online portal',
    subtitle: 'Irish Naturalisation and Immigration Service',
    category: 'law',
    daysAgo: 8,
    likes: 8.7,
    countryTag: 'Ireland',
    routeTag: 'Stamp 4',
    summary:
      'INIS moved most Stamp 4 renewal steps online to reduce in-person queues.',
    keyDetails:
      'Applicants upload employment proof, pay fees digitally, and later receive a postal biometric appointment.',
    meaning:
      'Plan scanning documents early because missing attachments pause the decision clock.',
    images: ['https://picsum.photos/seed/story11/800/600'],
  },
  {
    id: '12',
    title: 'Switching from asylum protection to skilled worker in Portugal',
    subtitle: 'Rahim · Lived Experience',
    category: 'personal',
    daysAgo: 18,
    likes: 13.5,
    countryTag: 'Portugal',
    routeTag: 'Skilled Worker',
    summary:
      'Rahim recounts moving from humanitarian protection to a skilled contract.',
    keyDetails:
      'Employer needed to show labour market test exemption, and Rahim obtained fresh police certificates.',
    meaning:
      'Keeping records organised made the SEF interview smoother when explaining the status change.',
    images: ['https://picsum.photos/seed/story12/800/600'],
  },
  {
    id: '13',
    title: 'France updates Talent Passport tech role definitions',
    subtitle: 'Ministry for Europe and Foreign Affairs',
    category: 'law',
    daysAgo: 3,
    likes: 12.1,
    countryTag: 'France',
    routeTag: 'Talent Passport',
    summary:
      'New guidance defines which tech roles qualify for the Talent Passport fast track.',
    keyDetails:
      'Expanded list includes AI security roles, salary floor raised to twice the minimum wage, and remote-first contracts must show French presence.',
    meaning:
      'Tech founders should adjust employment offers and include job descriptions aligning with the official list.',
    images: ['https://picsum.photos/seed/story13/800/600'],
    isSpotlight: true,
  },
  {
    id: '14',
    title: 'Reuniting siblings through New Zealand dependent child visa',
    subtitle: 'Sofia · Community Story',
    category: 'personal',
    daysAgo: 14,
    likes: 7.4,
    countryTag: 'New Zealand',
    routeTag: 'Dependent Child Visa',
    summary:
      'Sofia shares how she documented care arrangements to sponsor her younger brother.',
    keyDetails:
      'Guardianship orders, school enrolment letters, and proof of income convinced the case officer.',
    meaning:
      'Showing a long-term care plan mattered more than submitting a stack of general support letters.',
    images: ['https://picsum.photos/seed/story14/800/600'],
  },
  {
    id: '15',
    title: 'UAE extends Golden Visa eligibility to experienced teachers',
    subtitle: 'UAE Government Media Office',
    category: 'law',
    daysAgo: 5,
    likes: 17.8,
    countryTag: 'UAE',
    routeTag: 'Golden Visa',
    summary:
      'A decree now lets accredited teachers apply for long-term residence.',
    keyDetails:
      'Teachers need ten years of experience, Ministry recognition, and references from their school leadership.',
    meaning:
      'Education professionals should gather certificates early to meet the attestation timeline.',
    images: ['https://picsum.photos/seed/story15/800/600'],
  },
  {
    id: '16',
    title: 'How I secured an O-1 after building a remote portfolio',
    subtitle: 'Jordan · Community Story',
    category: 'personal',
    daysAgo: 21,
    likes: 23.4,
    countryTag: 'United States',
    routeTag: 'O-1',
    summary:
      'Jordan shows the evidence tracker that turned freelance achievements into an O-1 petition.',
    keyDetails:
      'Press citations, expert letters, and proof of high-income contracts were collated in a shared drive.',
    meaning:
      'Curating achievements as they happen reduces stress when the attorney requests exhibits.',
    images: ['https://picsum.photos/seed/story16/800/600'],
    isSpotlight: true,
  },
  {
    id: '17',
    title: 'Japan resumes working holiday slots with regional lottery system',
    subtitle: 'Ministry of Foreign Affairs of Japan',
    category: 'law',
    daysAgo: 1,
    likes: 6.3,
    countryTag: 'Japan',
    routeTag: 'Working Holiday',
    summary:
      'Japan reopened working holiday quotas using staggered lotteries per embassy.',
    keyDetails:
      'Applicants must register online, confirm funds thresholds, and attend group orientations.',
    meaning:
      'Submit documents quickly when the embassy emails your lottery slot, as seats expire within 48 hours.',
    images: ['https://picsum.photos/seed/story17/800/600'],
  },
  {
    id: '18',
    title: 'Navigating Italy elective residence renewals on a fixed income',
    subtitle: 'Helena · Community Story',
    category: 'personal',
    daysAgo: 30,
    likes: 8.9,
    countryTag: 'Italy',
    routeTag: 'Elective Residence',
    summary:
      'Helena details how she budgeted and documented pensions to renew her elective residence.',
    keyDetails:
      'Bank history covering the full year plus private health insurance letters satisfied the prefecture.',
    meaning:
      'Consistent deposits and clear translations reduce follow-up visits.',
    images: ['https://picsum.photos/seed/story18/800/600'],
  },
  {
    id: '19',
    title: 'USCIS updates premium processing timeline for EB-1C managers',
    subtitle: 'USCIS',
    category: 'law',
    daysAgo: 11,
    likes: 19.2,
    countryTag: 'United States',
    routeTag: 'EB-1C',
    summary:
      'Premium processing now promises decisions in 45 days for EB-1C multinational managers.',
    keyDetails:
      'Fees increase, biometrics scheduling remains separate, and requests for evidence pause the 45-day clock.',
    meaning:
      'Companies should plan petition waves to align with the shorter adjudication window but budget for the higher fee.',
    images: ['https://picsum.photos/seed/story19/800/600'],
  },
  {
    id: '20',
    title: 'Winning a German family reunion appeal after initial denial',
    subtitle: 'Samira · Community Story',
    category: 'personal',
    daysAgo: 25,
    likes: 10.6,
    countryTag: 'Germany',
    routeTag: 'Family Reunion',
    summary:
      'Samira explains the appeal strategy that overcame doubts about housing space.',
    keyDetails:
      'Architect letter verifying room measurements and updated rental contract convinced the embassy.',
    meaning:
      'Detailed apartment layouts can counter generic refusals that claim insufficient space.',
    images: ['https://picsum.photos/seed/story20/800/600'],
  },
  {
    id: '21',
    title: 'South Africa introduces critical skills pathway for data analysts',
    subtitle: 'Department of Home Affairs',
    category: 'law',
    daysAgo: 17,
    likes: 9.1,
    countryTag: 'South Africa',
    routeTag: 'Critical Skills Visa',
    summary:
      'Data analytics roles are explicitly listed in the new critical skills update.',
    keyDetails:
      'Applicants must register with professional bodies, show degree equivalency, and secure contracts above the minimum salary.',
    meaning:
      'Graduates should begin the SAQA evaluation early since it remains the longest step.',
    images: ['https://picsum.photos/seed/story21/800/600'],
  },
  {
    id: '22',
    title: 'How childcare evidence strengthened my UK Global Talent case',
    subtitle: 'Priya · Community Story',
    category: 'personal',
    daysAgo: 15,
    likes: 12.4,
    countryTag: 'UK',
    routeTag: 'Global Talent',
    summary:
      'Priya shows how community leadership and childcare volunteering boosted her endorsement.',
    keyDetails:
      'Letters from accelerators, export growth data, and childcare mentorship logs showcased wider impact.',
    meaning:
      'Demonstrating community benefit can offset a thinner awards list.',
    images: ['https://picsum.photos/seed/story22/800/600'],
  },
  {
    id: '23',
    title: 'Mexico publishes new regularisation scheme for long-term visitors',
    subtitle: 'Instituto Nacional de Migración',
    category: 'law',
    daysAgo: 13,
    likes: 7.7,
    countryTag: 'Mexico',
    routeTag: 'Regularisation',
    summary:
      'A transitional regularisation window lets long-stay visitors apply without fines.',
    keyDetails:
      'Proof of entry before 2021, clean record, and payment of updated fees are required.',
    meaning:
      'Eligible residents should secure appointments quickly because quotas are limited by state.',
    images: ['https://picsum.photos/seed/story23/800/600'],
  },
  {
    id: '24',
    title: 'Switching from Brazilian student visa to tech work permit',
    subtitle: 'Luisa · Community Story',
    category: 'personal',
    daysAgo: 19,
    likes: 9.5,
    countryTag: 'Brazil',
    routeTag: 'Tech Work Permit',
    summary:
      'Luisa documents the timeline to move from a student stay to a sponsored tech role.',
    keyDetails:
      'Employer filed at the general coordination office; proof of degree and Portuguese proficiency were crucial.',
    meaning:
      'Prepare notarised translations so your employer can submit without delays.',
    images: ['https://picsum.photos/seed/story24/800/600'],
  },
  {
    id: '25',
    title: 'Netherlands introduces pilot for startup founders outside EU',
    subtitle: 'Netherlands Enterprise Agency',
    category: 'law',
    daysAgo: 4,
    likes: 11.9,
    countryTag: 'Netherlands',
    routeTag: 'Startup Visa',
    summary:
      'A one-year pilot supports non-EU founders with incubator partners outside major cities.',
    keyDetails:
      'Founders need mentor agreements, a business plan summary, and proof of 30,000 euros in funds.',
    meaning:
      'Consider regional incubators to improve acceptance odds under the limited pilot slots.',
    images: ['https://picsum.photos/seed/story25/800/600'],
  },
  {
    id: '26',
    title: 'Rebuilding credit for US adjustment of status after Chapter 13',
    subtitle: 'Eli · Community Story',
    category: 'personal',
    daysAgo: 34,
    likes: 6.8,
    countryTag: 'United States',
    routeTag: 'Adjustment of Status',
    summary:
      'Eli shares how he cleared a Chapter 13 bankruptcy before his marriage-based interview.',
    keyDetails:
      'Discharge letters, payment history, and co-sponsor affidavits satisfied financial scrutiny.',
    meaning:
      'Keep bankruptcy court notices organised; the officer mainly cared about compliance.',
    images: ['https://picsum.photos/seed/story26/800/600'],
  },
  {
    id: '27',
    title: 'Singapore revises COMPASS scoring with sustainability bonus',
    subtitle: 'Ministry of Manpower',
    category: 'law',
    daysAgo: 6,
    likes: 13.3,
    countryTag: 'Singapore',
    routeTag: 'Employment Pass',
    summary:
      'Companies scoring high on green initiatives receive additional COMPASS points.',
    keyDetails:
      'Sustainability reports and certified energy reductions supply the bonus; the salary grid stays unchanged.',
    meaning:
      'Employers can offset missing diversity points by documenting ESG performance.',
    images: ['https://picsum.photos/seed/story27/800/600'],
  },
  {
    id: '28',
    title: 'K1 visa medical waiver approved after chronic illness disclosure',
    subtitle: 'Noor · Community Story',
    category: 'personal',
    daysAgo: 28,
    likes: 14.1,
    countryTag: 'United States',
    routeTag: 'K-1 Fiance',
    summary:
      'Noor explains how honest medical records led to a waiver instead of a denial.',
    keyDetails:
      'Panel physician referral, CDC packet, and joint care plan letter satisfied the consular officer.',
    meaning:
      'Bring treatment history and show your partner understands ongoing care commitments.',
    images: ['https://picsum.photos/seed/story28/800/600'],
  },
  {
    id: '29',
    title: 'UK expands Youth Mobility to more EU countries',
    subtitle: 'UK Home Office',
    category: 'law',
    daysAgo: 10,
    likes: 20.4,
    countryTag: 'UK',
    routeTag: 'Youth Mobility Scheme',
    summary:
      'New agreements bring more EU members onto the Youth Mobility list.',
    keyDetails:
      'Age cap remains 35 for certain countries, quotas differ, and second-year extensions will be phased in.',
    meaning:
      'Prospective applicants should track opening dates because quotas usually fill within hours.',
    images: ['https://picsum.photos/seed/story29/800/600'],
    isSpotlight: true,
  },
  {
    id: '30',
    title: 'Studying in Sweden with a family: managing housing proof',
    subtitle: 'Alina · Community Story',
    category: 'personal',
    daysAgo: 22,
    likes: 5.9,
    countryTag: 'Sweden',
    routeTag: 'Student Residence Permit',
    summary:
      'Alina outlines how she provided housing for a family of four on a student permit.',
    keyDetails:
      'Municipal lease, income breakdown, and screenshots from the accommodation portal convinced Migrationsverket.',
    meaning:
      'Line up housing before applying; the agency wanted proof of rooms per family member.',
    images: ['https://picsum.photos/seed/story30/800/600'],
  },
  {
    id: '31',
    title: 'Belgium digitises professional card renewals for self-employed',
    subtitle: 'FPS Economy',
    category: 'law',
    daysAgo: 16,
    likes: 8.2,
    countryTag: 'Belgium',
    routeTag: 'Professional Card',
    summary:
      'Renewals now require uploads through the regional business counter portal.',
    keyDetails:
      'Applicants must supply tax certificates, social security proof, and updated turnover projections.',
    meaning:
      'Scanning accountant letters ahead of time avoids portal timeouts.',
    images: ['https://picsum.photos/seed/story31/800/600'],
  },
  {
    id: '32',
    title: 'Navigating South Korean D-2 to D-8 startup transition',
    subtitle: 'Minji · Community Story',
    category: 'personal',
    daysAgo: 18,
    likes: 9.8,
    countryTag: 'South Korea',
    routeTag: 'D-8 Startup',
    summary:
      'Minji moved from a graduate D-2 visa to a D-8 startup status with university support.',
    keyDetails:
      'She built a prototype, secured seed funding, and the university technology park issued the endorsement.',
    meaning:
      'Keep receipts for research expenses; officials asked for proof the funding was used on development.',
    images: ['https://picsum.photos/seed/story32/800/600'],
  },
  {
    id: '33',
    title: 'US Department of State halves wait times for F-1 visa interviews',
    subtitle: 'US Department of State',
    category: 'law',
    daysAgo: 7,
    likes: 18.9,
    countryTag: 'United States',
    routeTag: 'F-1 Student',
    summary:
      'Embassies expanded staffing for student season, cutting average waits in half.',
    keyDetails:
      'More interview slots open on Mondays, and some posts waive interviews for recent visa holders.',
    meaning:
      'Check the online calendar early morning and update DS-160 confirmation if your slot changes.',
    images: ['https://picsum.photos/seed/story33/800/600'],
    isSpotlight: true,
  },
  {
    id: '34',
    title: 'Canadian PGWP holder secures PR after switching employers twice',
    subtitle: 'Nav · Community Story',
    category: 'personal',
    daysAgo: 40,
    likes: 11.7,
    countryTag: 'Canada',
    routeTag: 'Express Entry',
    summary:
      'Nav logged work hours meticulously across multiple employers to maintain CRS points.',
    keyDetails:
      'Letters of employment included NOC duties, and he uploaded pay stubs to prove continuity.',
    meaning:
      'Track your hours monthly; it simplified proof when his lawyer updated the profile.',
    images: ['https://picsum.photos/seed/story34/800/600'],
  },
  {
    id: '35',
    title: 'Norway introduces language requirement for permanent residence',
    subtitle: 'Norwegian Directorate of Immigration',
    category: 'law',
    daysAgo: 20,
    likes: 7.5,
    countryTag: 'Norway',
    routeTag: 'Permanent Residence',
    summary:
      'Applicants now need to pass A2 oral exams and a social studies test.',
    keyDetails:
      'Evidence of course attendance and exam booking must be uploaded with the application.',
    meaning:
      'Book language exams early since rural testing centres fill quickly.',
    images: ['https://picsum.photos/seed/story35/800/600'],
  },
  {
    id: '36',
    title: 'Preparing for US removal of conditions interview with remote work income',
    subtitle: 'Ana · Community Story',
    category: 'personal',
    daysAgo: 27,
    likes: 10.3,
    countryTag: 'United States',
    routeTag: 'Removal of Conditions',
    summary:
      'Ana describes how she proved real marriage while earning abroad as a remote contractor.',
    keyDetails:
      'Joint taxes, time zone schedules, and travel receipts helped prove cohabitation.',
    meaning:
      'Keep joint financial statements even when one spouse travels extensively.',
    images: ['https://picsum.photos/seed/story36/800/600'],
  },
  {
    id: '37',
    title: 'Saudi Arabia launches five-year Premium Residency route',
    subtitle: 'Saudi Premium Residency',
    category: 'law',
    daysAgo: 9,
    likes: 13.6,
    countryTag: 'Saudi Arabia',
    routeTag: 'Premium Residency',
    summary:
      'A new five-year package targets investors and professionals seeking longer stays.',
    keyDetails:
      'Applicants must prove income of 40,000 SAR monthly, medical insurance, and background checks.',
    meaning:
      'Companies sponsoring executives should weigh the cost against iqama renewals.',
    images: ['https://picsum.photos/seed/story37/800/600'],
  },
  {
    id: '38',
    title: 'Family reunification in Argentina after remote court hearings',
    subtitle: 'Valeria · Community Story',
    category: 'personal',
    daysAgo: 33,
    likes: 6.9,
    countryTag: 'Argentina',
    routeTag: 'Family Reunification',
    summary:
      'Valeria recounts how remote hearings sped up her reunited family case.',
    keyDetails:
      'Digital affidavits, notarised video testimonies, and translation stamps proved relationship continuity.',
    meaning:
      'Learn the provincial court tech requirements so you do not miss virtual hearings.',
    images: ['https://picsum.photos/seed/story38/800/600'],
  },
  {
    id: '39',
    title: 'Philippines updates AEP processing with online appointments',
    subtitle: 'Department of Labor and Employment',
    category: 'law',
    daysAgo: 14,
    likes: 5.7,
    countryTag: 'Philippines',
    routeTag: 'Alien Employment Permit',
    summary:
      'AEP offices now require online scheduling and pre-upload of documents.',
    keyDetails:
      'Employers must upload contracts, SEC registration, and tax IDs before paying fees.',
    meaning:
      'Submitting clean scans avoids being bumped from your appointment window.',
    images: ['https://picsum.photos/seed/story39/800/600'],
  },
  {
    id: '40',
    title: 'Moving parents to Denmark under the special caregiver permit',
    subtitle: 'Kamal · Community Story',
    category: 'personal',
    daysAgo: 45,
    likes: 7.1,
    countryTag: 'Denmark',
    routeTag: 'Caregiver Permit',
    summary:
      'Kamal outlines the documents that allowed his parents to relocate to provide childcare.',
    keyDetails:
      'Municipal approval, housing inspection, and financial guarantees were mandatory.',
    meaning:
      'Expect multiple municipality visits; scheduling them early saved weeks.',
    images: ['https://picsum.photos/seed/story40/800/600'],
  },
  {
    id: '41',
    title: 'Colombia enables digital cedula for migrant visas',
    subtitle: 'Migración Colombia',
    category: 'law',
    daysAgo: 6,
    likes: 9.6,
    countryTag: 'Colombia',
    routeTag: 'Migrant Visa',
    summary:
      'Migrant visa holders can now request a digital cedula that syncs with the mobile ID app.',
    keyDetails:
      'Applicants upload biometric data, pay online, and receive a QR code for verification.',
    meaning:
      'Keep your email accessible; the activation link expires in 72 hours.',
    images: ['https://picsum.photos/seed/story41/800/600'],
  },
  {
    id: '42',
    title: 'Balancing French talent passport with remote US employer',
    subtitle: 'Lea · Community Story',
    category: 'personal',
    daysAgo: 23,
    likes: 8.8,
    countryTag: 'France',
    routeTag: 'Talent Passport',
    summary:
      'Lea convinced OFII that her remote US job still met French payroll expectations.',
    keyDetails:
      'She set up a French payroll provider, filed URSSAF declarations, and kept a local desk lease.',
    meaning:
      'Scheduling tax consultations early avoided compliance surprises.',
    images: ['https://picsum.photos/seed/story42/800/600'],
  },
  {
    id: '43',
    title: 'India launches streamlined OCI renewal for overseas citizens',
    subtitle: 'Ministry of Home Affairs',
    category: 'law',
    daysAgo: 24,
    likes: 9.4,
    countryTag: 'India',
    routeTag: 'OCI',
    summary:
      'OCI renewal now uses a simplified form for those under 20 or over 50.',
    keyDetails:
      'Digital photo standards changed, and applicants can self-upload documents without visiting FRRO.',
    meaning:
      'Double-check photo dimensions; the portal rejects most mismatched uploads.',
    images: ['https://picsum.photos/seed/story43/800/600'],
  },
  {
    id: '44',
    title: 'Gaining Swiss family reunification after same-sex marriage legalisation',
    subtitle: 'Mateus · Community Story',
    category: 'personal',
    daysAgo: 52,
    likes: 12.2,
    countryTag: 'Switzerland',
    routeTag: 'Family Reunification',
    summary:
      'Mateus describes how the marriage law change opened a direct reunification path.',
    keyDetails:
      'Civil status certificates, employer consent, and proof of private housing were key.',
    meaning:
      'The cantonal office was supportive when the documents were neatly translated and certified.',
    images: ['https://picsum.photos/seed/story44/800/600'],
  },
  {
    id: '45',
    title: 'Portugal adds tech fast track within the D3 highly qualified visa',
    subtitle: 'Portuguese Agency for Competitiveness',
    category: 'law',
    daysAgo: 18,
    likes: 14.7,
    countryTag: 'Portugal',
    routeTag: 'D3 Highly Qualified',
    summary:
      'A tech fast track promises decisions in 30 days for certain roles.',
    keyDetails:
      'Employers must join the Tech Visa registry, and candidates need contracts meeting salary multipliers.',
    meaning:
      'Coordinate with HR to register the company before signing job offers.',
    images: ['https://picsum.photos/seed/story45/800/600'],
  },
  {
    id: '46',
    title: 'Supporting documents for Thai retirement visa extension',
    subtitle: 'Somsak · Community Story',
    category: 'personal',
    daysAgo: 60,
    likes: 6.4,
    countryTag: 'Thailand',
    routeTag: 'Retirement Visa',
    summary:
      'Somsak shares how he combined bank deposits and income letters to extend his retirement stay.',
    keyDetails:
      'He used a joint bank account, embassy income affidavit, and 90-day reporting receipts.',
    meaning:
      'Keep the bank letter recent; immigration rejected one that was over seven days old.',
    images: ['https://picsum.photos/seed/story46/800/600'],
  },
  {
    id: '47',
    title: 'Israel updates tech worker B/1 visa with remote work allowances',
    subtitle: 'Population and Immigration Authority',
    category: 'law',
    daysAgo: 12,
    likes: 10.8,
    countryTag: 'Israel',
    routeTag: 'B/1 Work Visa',
    summary:
      'Tech workers can now spend up to 90 days abroad while keeping their B/1 status.',
    keyDetails:
      'Employers must log travel, maintain payroll contributions, and notify authorities if absences exceed limits.',
    meaning:
      'Plan remote sprints with HR so tax withholding stays compliant.',
    images: ['https://picsum.photos/seed/story47/800/600'],
  },
  {
    id: '48',
    title: 'Winning an Australian 482 nomination with regional reclassification',
    subtitle: 'Owen · Community Story',
    category: 'personal',
    daysAgo: 31,
    likes: 11.5,
    countryTag: 'Australia',
    routeTag: 'Temporary Skill Shortage',
    summary:
      'Owen convinced his company to switch to a regional office to secure nomination approval.',
    keyDetails:
      'He supplied labour market research, state incentives, and evidence the role could operate from the satellite office.',
    meaning:
      'Understanding regional concessions can unlock sponsorship when metro caps are tight.',
    images: ['https://picsum.photos/seed/story48/800/600'],
  },
  {
    id: '49',
    title: 'Chile introduces remote worker visa with social security proof',
    subtitle: 'Ministerio de Relaciones Exteriores de Chile',
    category: 'law',
    daysAgo: 8,
    likes: 7.2,
    countryTag: 'Chile',
    routeTag: 'Remote Worker Visa',
    summary:
      'Chile launched a remote worker visa requiring proof of overseas employer contributions.',
    keyDetails:
      'Applicants need contracts, foreign tax statements, and private health insurance covering Chile.',
    meaning:
      'Gather employer letters confirming remote status to avoid being asked for local contracts.',
    images: ['https://picsum.photos/seed/story49/800/600'],
  },
  {
    id: '50',
    title: 'My journey from seasonal worker to permanent resident in Finland',
    subtitle: 'Olga · Community Story',
    category: 'personal',
    daysAgo: 58,
    likes: 9,
    countryTag: 'Finland',
    routeTag: 'Seasonal Worker',
    summary:
      'Olga charts the steps from repeated seasonal permits to continuous residence.',
    keyDetails:
      'She documented work hours, upgraded language skills, and secured a full-time contract before applying.',
    meaning:
      'Keeping each season of employment contracts allowed the migration office to verify continuity quickly.',
    images: ['https://picsum.photos/seed/story50/800/600'],
  },
];

export const getStoryById = (id: string) => STORIES.find((story) => story.id === id);
