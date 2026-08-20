/**
 * The member-school roster. ENTIRELY FICTIONAL, and deliberately so.
 *
 * AMISA's real membership list is public, but attaching invented salaries,
 * participation status and data-quality flags to real, named schools would
 * manufacture a record about identifiable organisations. Every school here is
 * made up. The shape of the roster is faithful — PK–12 American international
 * schools, most under 1,000 students, the largest around 2,500, spread across
 * 25 countries — and the numbers under it are not anyone's.
 *
 * ONE PROPERTY IS LOAD-BEARING: exactly one school sits in Chile. That mirrors
 * the fact Dr. Rhoads gave on the August 6 call, and it is what makes the
 * privacy demonstration real rather than rhetorical — a benchmark cut by
 * country would name that school, which is why `suppression.ts` will not cut by
 * country at all. `amisaData.test.ts` asserts the count stays at one.
 *
 * Counts this roster is built to produce, all illustrative:
 *   70 member schools · 31 enrolled in the data system for year 1
 *   29 submitted Human Resources · 25 submitted the Business Office
 *   (so 6 participating schools have not opened it — the follow-up list)
 *   24 carry the master's-plus-three-years salary cell the hero benchmark uses
 *
 * Generated once from a seeded script and committed as a static array. It is
 * data, not a fixture factory: the app must render the same roster every run,
 * and Math.random() at module scope would break that.
 */

/** Which offices a school has submitted. Extend as further waves are modelled. */
export interface MemberSchool {
  id: string;
  name: string;
  country: string;
  /** Total students PK–12, October census. */
  enrollment: number;
  /** Published annual tuition, USD, before discounts. */
  tuition: number;
  /** Enrolled in the data system for year 1. Participation is voluntary. */
  participating: boolean;
  /** Submitted the Human Resources salary and benefits section. */
  submittedHr: boolean;
  /** Submitted the Business Office section. */
  submittedBusinessOffice: boolean;
  /**
   * Carries a teacher at master's + 3 years. A school can submit HR in full and
   * still not appear in this benchmark, simply by not employing anyone at that
   * combination — which is why the contributor count is quoted on screen.
   */
  contributesSalaryCell: boolean;
  /** Who AMISA would email about a missing section. Fictional. */
  contact: string;
  contactRole: string;
}

export const MEMBER_SCHOOL_ROSTER: MemberSchool[] = [
  { id: "sch-01", name: "Cordillera International School", country: "Colombia", enrollment: 1100, tuition: 14600, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Ana Lucía Restrepo", contactRole: "Human Resources Director" },
  { id: "sch-02", name: "Andes American International School", country: "Chile", enrollment: 963, tuition: 10800, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Luciana Salazar", contactRole: "Business Manager" },
  { id: "sch-03", name: "Riverbend International School", country: "Dominican Republic", enrollment: 1205, tuition: 15900, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Rafael Salazar", contactRole: "Director of Finance" },
  { id: "sch-04", name: "Palma American Academy", country: "El Salvador", enrollment: 299, tuition: 7250, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Patricia Cardoso", contactRole: "HR Coordinator" },
  { id: "sch-05", name: "Cordillera Country Day School", country: "Jamaica", enrollment: 1005, tuition: 13050, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Andrés Herrera", contactRole: "Head of Operations" },
  { id: "sch-06", name: "Atlantica International School", country: "Brazil", enrollment: 1338, tuition: 16750, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Emilio Lozano", contactRole: "Human Resources Director" },
  { id: "sch-07", name: "Highland American Academy", country: "Guyana", enrollment: 1916, tuition: 15000, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Rafael Ferreira", contactRole: "Business Manager" },
  { id: "sch-08", name: "Cascadia American School", country: "Bahamas", enrollment: 1442, tuition: 13750, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Emilio Marín", contactRole: "Director of Finance" },
  { id: "sch-09", name: "Meridian Country Day School", country: "Venezuela", enrollment: 406, tuition: 8400, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Bruno Ibarra", contactRole: "HR Coordinator" },
  { id: "sch-10", name: "Sierra American Academy", country: "Trinidad and Tobago", enrollment: 1372, tuition: 19300, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Ana Lucía Tavares", contactRole: "Head of Operations" },
  { id: "sch-11", name: "Northgate International College", country: "Jamaica", enrollment: 833, tuition: 14000, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Gabriela Restrepo", contactRole: "Human Resources Director" },
  { id: "sch-12", name: "Colonial International School", country: "Guatemala", enrollment: 895, tuition: 14800, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: false, contact: "Patricia Herrera", contactRole: "Business Manager" },
  { id: "sch-13", name: "Bayview American School", country: "Paraguay", enrollment: 1213, tuition: 10250, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Sebastián Rivas", contactRole: "Director of Finance" },
  { id: "sch-14", name: "Lakeside International College", country: "Guatemala", enrollment: 964, tuition: 12700, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Patricia Salazar", contactRole: "HR Coordinator" },
  { id: "sch-15", name: "Summit American School", country: "Barbados", enrollment: 990, tuition: 10150, participating: true, submittedHr: true, submittedBusinessOffice: false, contributesSalaryCell: true, contact: "Paula Sandoval", contactRole: "Head of Operations" },
  { id: "sch-16", name: "Coral American International School", country: "Uruguay", enrollment: 1103, tuition: 9500, participating: true, submittedHr: false, submittedBusinessOffice: true, contributesSalaryCell: false, contact: "Renata Navarro", contactRole: "Human Resources Director" },
  { id: "sch-17", name: "Valle American School", country: "Jamaica", enrollment: 2467, tuition: 20950, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Luciana Carvalho", contactRole: "Business Manager" },
  { id: "sch-18", name: "Monte American International School", country: "Suriname", enrollment: 272, tuition: 8450, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Diego Moreira", contactRole: "Director of Finance" },
  { id: "sch-19", name: "Pacific International College", country: "Colombia", enrollment: 356, tuition: 8700, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Emilio Quiroga", contactRole: "HR Coordinator" },
  { id: "sch-20", name: "Southbridge American School", country: "Uruguay", enrollment: 1475, tuition: 13300, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Gabriela Jiménez", contactRole: "Head of Operations" },
  { id: "sch-21", name: "Cedar American School", country: "Venezuela", enrollment: 955, tuition: 11100, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Joaquín Salazar", contactRole: "Human Resources Director" },
  { id: "sch-22", name: "Harbour International College", country: "Trinidad and Tobago", enrollment: 1237, tuition: 13000, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Camila Moreira", contactRole: "Business Manager" },
  { id: "sch-23", name: "Vista International School", country: "Uruguay", enrollment: 1292, tuition: 14500, participating: true, submittedHr: false, submittedBusinessOffice: true, contributesSalaryCell: false, contact: "Alejandro Salazar", contactRole: "Director of Finance" },
  { id: "sch-24", name: "Torres International Academy", country: "El Salvador", enrollment: 835, tuition: 9800, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Sofía Jiménez", contactRole: "HR Coordinator" },
  { id: "sch-25", name: "Bellavista International Academy", country: "Ecuador", enrollment: 830, tuition: 11100, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: false, contact: "Beatriz Guerrero", contactRole: "Head of Operations" },
  { id: "sch-26", name: "Roble American School", country: "Honduras", enrollment: 1146, tuition: 13800, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Nicolás Ortega", contactRole: "Human Resources Director" },
  { id: "sch-27", name: "Marina American School", country: "Argentina", enrollment: 871, tuition: 7800, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Emilio Moreira", contactRole: "Business Manager" },
  { id: "sch-28", name: "Frontera American International School", country: "Nicaragua", enrollment: 1283, tuition: 16550, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Diego Sandoval", contactRole: "Director of Finance" },
  { id: "sch-29", name: "Solano American International School", country: "Dominican Republic", enrollment: 571, tuition: 11450, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Ricardo Ortega", contactRole: "HR Coordinator" },
  { id: "sch-30", name: "Verde American School", country: "Brazil", enrollment: 1294, tuition: 18800, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Martín Salazar", contactRole: "Head of Operations" },
  { id: "sch-31", name: "Aurora American School", country: "Peru", enrollment: 615, tuition: 10250, participating: true, submittedHr: true, submittedBusinessOffice: false, contributesSalaryCell: true, contact: "Martín Carvalho", contactRole: "Human Resources Director" },
  { id: "sch-32", name: "Alameda American Academy", country: "Panama", enrollment: 1266, tuition: 10550, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Alejandro Moreira", contactRole: "Business Manager" },
  { id: "sch-33", name: "Encinas American Academy", country: "Costa Rica", enrollment: 1317, tuition: 14150, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Diego Klein", contactRole: "Director of Finance" },
  { id: "sch-34", name: "Granada International College", country: "Panama", enrollment: 647, tuition: 9200, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Mariana Sandoval", contactRole: "HR Coordinator" },
  { id: "sch-35", name: "Laguna International College", country: "Bahamas", enrollment: 1497, tuition: 20200, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Camila Valdés", contactRole: "Head of Operations" },
  { id: "sch-36", name: "Mirador International Academy", country: "Venezuela", enrollment: 2356, tuition: 22950, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Ricardo Rivas", contactRole: "Human Resources Director" },
  { id: "sch-37", name: "Nogales American School", country: "Peru", enrollment: 349, tuition: 9200, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Emilio Cardoso", contactRole: "Business Manager" },
  { id: "sch-38", name: "Olivar American International School", country: "Mexico", enrollment: 472, tuition: 10050, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Gabriela Guerrero", contactRole: "Director of Finance" },
  { id: "sch-39", name: "Quinta American International School", country: "Suriname", enrollment: 346, tuition: 6950, participating: true, submittedHr: true, submittedBusinessOffice: false, contributesSalaryCell: true, contact: "Carolina Quiroga", contactRole: "HR Coordinator" },
  { id: "sch-40", name: "Ribera International College", country: "Nicaragua", enrollment: 681, tuition: 12050, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Fernando Jiménez", contactRole: "Head of Operations" },
  { id: "sch-41", name: "Santa Elena Country Day School", country: "Dominican Republic", enrollment: 1478, tuition: 17300, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Diego Delgado", contactRole: "Human Resources Director" },
  { id: "sch-42", name: "Terraza American School", country: "El Salvador", enrollment: 654, tuition: 10200, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Fernando Ibarra", contactRole: "Business Manager" },
  { id: "sch-43", name: "Ventana International School", country: "Guatemala", enrollment: 269, tuition: 7600, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: false, contact: "Mateo Sandoval", contactRole: "Director of Finance" },
  { id: "sch-44", name: "Zaragoza International College", country: "Argentina", enrollment: 829, tuition: 12350, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Patricia Quiroga", contactRole: "HR Coordinator" },
  { id: "sch-45", name: "Bosque American School", country: "Bolivia", enrollment: 855, tuition: 14500, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Renata Quiroga", contactRole: "Head of Operations" },
  { id: "sch-46", name: "Cumbre American International School", country: "Costa Rica", enrollment: 1311, tuition: 18300, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Daniela Lozano", contactRole: "Human Resources Director" },
  { id: "sch-47", name: "Delta Country Day School", country: "Bolivia", enrollment: 1004, tuition: 11050, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: false, contact: "Paula Aguilar", contactRole: "Business Manager" },
  { id: "sch-48", name: "Estrella American School", country: "Ecuador", enrollment: 1386, tuition: 14700, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: false, contact: "Rafael Klein", contactRole: "Director of Finance" },
  { id: "sch-49", name: "Fuente International College", country: "Brazil", enrollment: 262, tuition: 5400, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Joaquín Escobar", contactRole: "HR Coordinator" },
  { id: "sch-50", name: "Horizonte International College", country: "Bahamas", enrollment: 1295, tuition: 14600, participating: true, submittedHr: true, submittedBusinessOffice: false, contributesSalaryCell: true, contact: "Martín Ferreira", contactRole: "Head of Operations" },
  { id: "sch-51", name: "Isla American Academy", country: "Mexico", enrollment: 834, tuition: 13350, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Elena Rivas", contactRole: "Human Resources Director" },
  { id: "sch-52", name: "Jardin American Academy", country: "Colombia", enrollment: 1433, tuition: 15200, participating: true, submittedHr: true, submittedBusinessOffice: false, contributesSalaryCell: true, contact: "Renata Restrepo", contactRole: "Business Manager" },
  { id: "sch-53", name: "Llanos International College", country: "Paraguay", enrollment: 990, tuition: 10400, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Mateo Vargas", contactRole: "Director of Finance" },
  { id: "sch-54", name: "Manglar American School", country: "Panama", enrollment: 1261, tuition: 14950, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Joaquín Marín", contactRole: "HR Coordinator" },
  { id: "sch-55", name: "Nevado American International School", country: "Barbados", enrollment: 1384, tuition: 17600, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Mateo Peralta", contactRole: "Head of Operations" },
  { id: "sch-56", name: "Oriente Country Day School", country: "Honduras", enrollment: 624, tuition: 10250, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Tomás Quiroga", contactRole: "Human Resources Director" },
  { id: "sch-57", name: "Pinar International College", country: "Peru", enrollment: 530, tuition: 10400, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Felipe Cardoso", contactRole: "Business Manager" },
  { id: "sch-58", name: "Quebrada American School", country: "Paraguay", enrollment: 2144, tuition: 25850, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Gabriela Ibarra", contactRole: "Director of Finance" },
  { id: "sch-59", name: "Rincon Country Day School", country: "Ecuador", enrollment: 257, tuition: 7750, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Beatriz Klein", contactRole: "HR Coordinator" },
  { id: "sch-60", name: "Selva American International School", country: "Haiti", enrollment: 265, tuition: 6750, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Sofía Herrera", contactRole: "Head of Operations" },
  { id: "sch-61", name: "Tierra International Academy", country: "Trinidad and Tobago", enrollment: 669, tuition: 10200, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Mateo Marín", contactRole: "Human Resources Director" },
  { id: "sch-62", name: "Volcan International College", country: "Mexico", enrollment: 380, tuition: 6550, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Joaquín Sandoval", contactRole: "Business Manager" },
  { id: "sch-63", name: "Mirasol American International School", country: "Nicaragua", enrollment: 282, tuition: 7600, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Sofía Marín", contactRole: "Director of Finance" },
  { id: "sch-64", name: "Altamira International Academy", country: "Bolivia", enrollment: 1152, tuition: 12450, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Diego Ferreira", contactRole: "HR Coordinator" },
  { id: "sch-65", name: "Costa Verde International Academy", country: "Colombia", enrollment: 637, tuition: 11800, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Andrés Ibarra", contactRole: "Head of Operations" },
  { id: "sch-66", name: "Sabana International School", country: "Barbados", enrollment: 313, tuition: 8000, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Camila Restrepo", contactRole: "Human Resources Director" },
  { id: "sch-67", name: "Buenavista American School", country: "Haiti", enrollment: 1267, tuition: 16700, participating: true, submittedHr: true, submittedBusinessOffice: false, contributesSalaryCell: true, contact: "Fernando Delgado", contactRole: "Business Manager" },
  { id: "sch-68", name: "Los Cedros International School", country: "Guyana", enrollment: 507, tuition: 10700, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Fernando Sandoval", contactRole: "Director of Finance" },
  { id: "sch-69", name: "Puerto Nuevo American International School", country: "Costa Rica", enrollment: 453, tuition: 7500, participating: false, submittedHr: false, submittedBusinessOffice: false, contributesSalaryCell: false, contact: "Elena Fonseca", contactRole: "HR Coordinator" },
  { id: "sch-70", name: "Campoverde Country Day School", country: "Honduras", enrollment: 696, tuition: 10550, participating: true, submittedHr: true, submittedBusinessOffice: true, contributesSalaryCell: true, contact: "Daniela Restrepo", contactRole: "Head of Operations" },];

/**
 * Ana Lucía Restrepo's school — the HR persona's own school, and the subject of
 * the peer comparison Dr. Rhoads runs. About 1,100 students in Colombia, per the
 * talk track. Pinned by id rather than found by name so a rename cannot silently
 * repoint the demo at a different school.
 */
export const HOME_SCHOOL_ID = 'sch-01';

export const homeSchool = (): MemberSchool =>
  MEMBER_SCHOOL_ROSTER.find((s) => s.id === HOME_SCHOOL_ID)!;

// ─── Derived counts. Never typed by hand. ───────────────────────────

export const participatingSchools = (): MemberSchool[] =>
  MEMBER_SCHOOL_ROSTER.filter((s) => s.participating);

export const hrSubmitters = (): MemberSchool[] =>
  MEMBER_SCHOOL_ROSTER.filter((s) => s.submittedHr);

export const salaryContributors = (): MemberSchool[] =>
  MEMBER_SCHOOL_ROSTER.filter((s) => s.contributesSalaryCell);

/**
 * Participating schools that have not opened the Business Office section — the
 * follow-up list. These are the schools Dr. Rhoads emails, and the same schools
 * that will not see the Business Office benchmark on October 1. Not a
 * punishment: office data is visible only to schools that entered it.
 */
export const businessOfficeMissing = (): MemberSchool[] =>
  MEMBER_SCHOOL_ROSTER.filter((s) => s.participating && !s.submittedBusinessOffice);
