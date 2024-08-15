/* --- TYPE DEFINITIONS --- */

export type TNullableNumber = number | null;
export type TNullableString = string | null;
export type TObjectKey = string | number;

export type TKeyMap = {
  [key: TObjectKey]: any;
};

export type TRatingScale = 1 | 2 | 3 | 4 | 5;

type TReviewsCountsByYearSemObject = {
  [yearKey: TObjectKey]: { [semesterTermKey: TObjectKey]: number };
};

export type TUserReviews = {
  [reviewId: string]: Review;
};

export type TProviderName = 'Google' | 'Facebook' | 'Github' | 'Apple';

/* --- DATA MODELS (API/DYNAMIC) --- */

// maintained and updated client-side/statically
export interface CourseDataStatic {
  courseId: TCourseId;
  name: TCourseName;
  departmentId: TDepartmentId;
  courseNumber: string;
  url: TNullableString; // url may be null (i.e., no existing page)
  aliases: string[];
  isDeprecated: boolean;
  isFoundational: boolean;
}

// maintained and updated by API/Firestore
export interface CourseDataDynamic {
  courseId: TCourseId;
  numReviews: number;
  avgWorkload: TNullableNumber;
  avgDifficulty: TNullableNumber;
  avgOverall: TNullableNumber;
  avgStaffSupport: TNullableNumber;
  reviewsCountsByYearSem: TReviewsCountsByYearSemObject;
}

export interface Course extends CourseDataStatic, CourseDataDynamic {}

export interface Review {
  reviewId: string; // format: `reviewId` === `courseId-year-semesterTerm-created`
  courseId: TCourseId;
  year: number;
  semesterId: TSemesterId;
  isLegacy: boolean;
  reviewerId: string; // `userId` of review author
  isGTVerifiedReviewer: boolean;
  created: number; // Unix timestamp
  modified: TNullableNumber; // Unix timestamp
  body: string;
  upvotes: number;
  downvotes: number;
  /* --- general review data --- */
  workload: number;
  difficulty: TRatingScale;
  overall: TRatingScale;
  staffSupport?: TRatingScale; // N.B. not previously implemented in legacy data
  /* --- course logistics review data --- */
  isRecommended?: boolean;
  isGoodFirstCourse?: boolean;
  isPairable?: boolean;
  hasGroupProjects?: boolean;
  hasWritingAssignments?: boolean;
  hasExamsQuizzes?: boolean;
  hasMandatoryReadings?: boolean;
  hasProgrammingAssignments?: boolean;
  hasProvidedDevEnv?: boolean;
  programmingLanguagesIds?: TProgrammingLanguageId[];
  /* --- user background review data --- */
  preparation?: TRatingScale;
  omsCoursesTaken?: TNullableNumber;
  hasRelevantWorkExperience?: boolean;
  experienceLevelId?: TExperienceLevelId;
  gradeId?: string;
}

export interface User {
  userId: TNullableString; // invalid request returns null
  hasGTEmail: boolean;
  educationLevelId?: TEducationLevelId;
  subjectAreaId?: string;
  workYears?: number;
  specializationId?: TSpecializationId;
  reviews: TUserReviews;
}

/* --- DATA MODELS (CLIENT-SIDE/STATIC) --- */

export interface Department {
  departmentId: TDepartmentId;
  name: TDepartmentName;
  url: string;
}

export interface Program {
  programId: TProgramId;
  name: TProgramName;
  url: string;
}

export interface Semester {
  semesterId: TSemesterId;
  term: TSemesterTerm;
  name: TSemesterName;
}

export interface Specialization {
  specializationId: TSpecializationId;
  name: TSpecializationName;
  programId: TProgramId;
}

export interface EducationLevel {
  educationLevelId: TEducationLevelId;
  name: TEducationLevelName;
}

export interface SubjectArea {
  subjectAreaId: TSubjectAreaId;
  name: TSubjectAreaName;
}

export interface ProgrammingLanguage {
  programmingLanguageId: TProgrammingLanguageId;
  name: TProgrammingLanguageName;
}

export interface Grade {
  gradeId: TGradeId;
  name: TGradeName;
}

/* --- PAYLOADS --- */

/* eslint-disable no-unused-vars */

export type TPayloadCoursesDataStatic = {
  [courseId in TCourseId]: CourseDataStatic;
};

export type TPayloadCoursesDataDynamic = {
  [courseId in TCourseId]: CourseDataDynamic;
};

export type TPayloadCourses = {
  [courseId in TCourseId]: Course;
};

export type TPayloadDepartments = {
  [departmentId in TDepartmentId]: Department;
};

export type TPayloadPrograms = {
  [programId in TProgramId]: Program;
};

export type TPayloadSemesters = {
  [semesterId in TSemesterId]: Semester;
};

export type TPayloadSpecializations = {
  [specializationId in TSpecializationId]: Specialization;
};

export type TPayloadReviews = {
  [reviewId: string]: Review;
};

export type TPayloadUsers = {
  [userId: string]: User;
};

export type TPayloadEducationLevels = {
  [educationLevelId in TEducationLevelId]: EducationLevel;
};

export type TPayloadSubjectAreas = {
  [subjectAreaId in TSubjectAreaId]: SubjectArea;
};

export type TPayloadProgrammingLanguages = {
  [programmingLanguageId in TProgrammingLanguageId]: ProgrammingLanguage;
};

export type TPayloadGrades = {
  [gradeId in TGradeId]: Grade;
};

/* eslint-enable no-unused-vars */

/* --- DATA MODELS TYPEDEFS --- */

export type TDepartmentId =
  | 'CS'
  | 'CSE'
  | 'ECE'
  | 'INTA'
  | 'ISYE'
  | 'MGT'
  | 'PUBP';

export type TDepartmentName =
  | 'Computer Science'
  | 'Computational Science and Engineering'
  | 'Electrical and Computer Engineering'
  | 'International Affairs'
  | 'Industrial and Systems Engineering'
  | 'Management'
  | 'Public Policy';

export type TProgramId = 'a' | 'cs' | 'cy';
export type TProgramName = 'Analytics' | 'Computer Science' | 'Cybersecurity';

export type TSemesterId = 'sp' | 'sm' | 'fa';
export type TSemesterTerm = 1 | 2 | 3;
export type TSemesterName = 'Spring' | 'Summer' | 'Fall';

export type TSpecializationId =
  | 'a:at'
  | 'a:ba'
  | 'a:cda'
  | 'cs:cpr'
  | 'cs:cs'
  | 'cs:ii'
  | 'cs:ml'
  | 'cy:es'
  | 'cy:is'
  | 'cy:pol';

export type TSpecializationName =
  | 'Analytical Tools'
  | 'Business Analytics'
  | 'Computational Data Analytics'
  | 'Computational Perception and Robotics'
  | 'Computing Systems'
  | 'Interactive Intelligence'
  | 'Machine Learning'
  | 'Energy Systems'
  | 'Information Security'
  | 'Policy';

export type TProgrammingLanguageId =
  | 'c'
  | 'cpp'
  | 'cs'
  | 'go'
  | 'java'
  | 'js'
  | 'kt'
  | 'php'
  | 'py'
  | 'rs'
  | 'r'
  | 'scala'
  | 'sql'
  | 'ts';

export type TProgrammingLanguageName =
  | 'C'
  | 'C++'
  | 'CS'
  | 'Golang'
  | 'Java'
  | 'JavaScript'
  | 'Kotlin'
  | 'PHP'
  | 'Python'
  | 'Rust'
  | 'R'
  | 'Scala'
  | 'SQL'
  | 'TypeScript';

export type TExperienceLevelId = 'jr' | 'mid' | 'sr'; // 'Junior, Mid, Senior'

export type TEducationLevelId = 'bach' | 'mast' | 'phd';
export type TEducationLevelName = 'Bachelor' | 'Master' | 'Doctorate (PhD)';

export type TSubjectAreaId =
  | 'act'
  | 'bus'
  | 'cs'
  | 'econ'
  | 'engrElec'
  | 'engrComp'
  | 'engrInd'
  | 'engrOther'
  | 'fin'
  | 'hlt'
  | 'human'
  | 'it'
  | 'law'
  | 'libArts'
  | 'med'
  | 'mis'
  | 'math'
  | 'natSci'
  | 'stats'
  | 'or'
  | 'phil'
  | 'phys'
  | 'zzOther'; // N.B. Prefixed with `zz` to always sort to end

export type TSubjectAreaName =
  | 'Actuarial Science'
  | 'Business - Other/General (Accounting, etc.)'
  | 'Computer Science'
  | 'Economics'
  | 'Electrical Engineering'
  | 'Computer Engineering'
  | 'Industrial Engineering'
  | 'Other Engineering'
  | 'Finance'
  | 'Health or Healthcare-Related (PA, Dentistry, etc.)'
  | 'Humanities'
  | 'Information Technology'
  | 'Law/Legal'
  | 'Liberal Arts'
  | 'Medicine or Premed'
  | 'Management Information Systems'
  | 'Mathematics'
  | 'Natural Sciences (Biology, Chemistry, etc.)'
  | 'Statistics'
  | 'Operations Research'
  | 'Philosophy'
  | 'Physics'
  | 'Other / Not Listed';

export type TGradeId = 'a' | 'b' | 'c' | 'd' | 'f' | 'w' | 'unk';
export type TGradeName =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'F'
  | 'W (Withdrawal)'
  | 'Prefer not to say';

export type TCourseId =
  | 'CS-6035'
  | 'CS-6150'
  | 'CS-6200'
  | 'CS-6210'
  | 'CS-6211'
  | 'CS-6238'
  | 'CS-6250'
  | 'CS-6260'
  | 'CS-6262'
  | 'CS-6263'
  | 'CS-6264'
  | 'CS-6265'
  | 'CS-6266'
  | 'CS-6290'
  | 'CS-6291'
  | 'CS-6300'
  | 'CS-6310'
  | 'CS-6340'
  | 'CS-6400'
  | 'CS-6440'
  | 'CS-6457'
  | 'CS-6460'
  | 'CS-6465'
  | 'CS-6475'
  | 'CS-6476'
  | 'CS-6515'
  | 'CS-6601'
  | 'CS-6603'
  | 'CS-6675'
  | 'CS-6726'
  | 'CS-6727'
  | 'CS-6747'
  | 'CS-6750'
  | 'CS-6795'
  | 'CS-7210'
  | 'CS-7280'
  | 'CS-7450'
  | 'CS-7470'
  | 'CS-7632'
  | 'CS-7637'
  | 'CS-7638'
  | 'CS-7639'
  | 'CS-7641'
  | 'CS-7642'
  | 'CS-7643'
  | 'CS-7646'
  | 'CS-7650'
  | 'CS-8803-O04'
  | 'CS-8803-O05'
  | 'CS-8803-O06'
  | 'CS-8803-O08'
  | 'CS-8803-O12'
  | 'CS-8803-O13'
  | 'CS-8803-O15'
  | 'CS-8803-O16'
  | 'CS-8803-O17'
  | 'CS-8803-O21'
  | 'CS-8803-O22'
  | 'CS-8803-OC1'
  | 'CS-8813'
  | 'CSE-6040'
  | 'CSE-6140'
  | 'CSE-6220'
  | 'CSE-6240'
  | 'CSE-6242'
  | 'CSE-6250'
  | 'CSE-6742'
  | 'ECE-6150'
  | 'ECE-6266'
  | 'ECE-6320'
  | 'ECE-6323'
  | 'ECE-8803a'
  | 'ECE-8803c'
  | 'ECE-8803d'
  | 'ECE-8803e'
  | 'ECE-8803g'
  | 'ECE-8803h'
  | 'ECE-8813'
  | 'ECE-8823'
  | 'ECE-8843'
  | 'ECE-8853'
  | 'ECE-8863'
  | 'ECE-8873'
  | 'INTA-6014'
  | 'INTA-6103'
  | 'INTA-6450'
  | 'INTA-8803G'
  | 'ISYE-6402'
  | 'ISYE-6404'
  | 'ISYE-6413'
  | 'ISYE-6414'
  | 'ISYE-6416'
  | 'ISYE-6420'
  | 'ISYE-6501'
  | 'ISYE-6644'
  | 'ISYE-6650'
  | 'ISYE-6669'
  | 'ISYE-6740'
  | 'ISYE-7406'
  | 'ISYE-8803'
  | 'MGT-6203'
  | 'MGT-6311'
  | 'MGT-6727'
  | 'MGT-6748'
  | 'MGT-8803'
  | 'MGT-8813'
  | 'MGT-8823'
  | 'PUBP-6111'
  | 'PUBP-6266'
  | 'PUBP-6501'
  | 'PUBP-6502'
  | 'PUBP-6725';
// | 'VIP-6600' // IGNORE -- ambiguous departmentId

/*
	course names references:
	https://catalog.gatech.edu/coursesaz/cs/
	https://catalog.gatech.edu/coursesaz/cse/
	https://catalog.gatech.edu/coursesaz/inta/
	https://catalog.gatech.edu/coursesaz/isye/
	https://catalog.gatech.edu/coursesaz/mgt/
	https://catalog.gatech.edu/coursesaz/pubp/
*/

export type TCourseName =
  | 'Introduction to Information Security'
  | 'Computing for Good'
  | 'Graduate Introduction to Operating Systems'
  | 'Advanced Operating Systems'
  | 'System Design for Cloud Computing'
  | 'Secure Computer Systems'
  | 'Computer Networks'
  | 'Applied Cryptography'
  | 'Network Security'
  | 'Intro to Cyber-Physical Systems Security'
  | 'Information Security Lab: System and Network Defenses'
  | 'Information Security Laboratory'
  | 'Information Security Practicum'
  | 'High-Performance Computer Architecture'
  | 'Embedded Software Optimizations'
  | 'Software Development Process'
  | 'Software Architecture and Design'
  | 'Advanced Topics in Software Analysis and Testing'
  | 'Database Systems Concepts and Design'
  | 'Introduction to Health Informatics'
  | 'Video Game Design and Programming'
  | 'Educational Technology: Conceptual Foundations'
  | 'Computational Journalism'
  | 'Computational Photography'
  | 'Introduction to Computer Vision'
  | 'Introduction to Graduate Algorithms'
  | 'Artificial Intelligence'
  | 'AI, Ethics, and Society'
  | 'Advanced Internet Computing Systems and Applications'
  | 'Privacy, Technology, Policy, and Law'
  | 'Cyber Security Practicum'
  | 'Advanced Topics in Malware Analysis'
  | 'Human-Computer Interaction'
  | 'Introduction to Cognitive Science'
  | 'Distributed Computing'
  | 'Network Science: Methods and Applications'
  | 'Information Visualization'
  | 'Mobile and Ubiquitous Computing'
  | 'Game Artificial Intelligence'
  | 'Knowledge-Based Artificial Intelligence: Cognitive Systems'
  | 'Artificial Intelligence Techniques for Robotics'
  | 'Cyber Physical Design and Analysis'
  | 'Machine Learning'
  | 'Reinforcement Learning and Decision Making'
  | 'Deep Learning'
  | 'Machine Learning for Trading'
  | 'Natural Language Processing'
  | 'Embedded Software'
  | 'Data Visualization for Health Informatics'
  | 'Biomedical Analytics'
  | 'Compilers: Theory and Practice'
  | 'Systems Issues in Cloud Computing'
  | 'Quantum Computing'
  | 'Introduction to Computing Law'
  | 'Digital Health Equity'
  | 'Global Entrepreneurship'
  | 'GPU Hardware and Software'
  | 'Security Incident Response'
  | 'Security Operations and Incidence Response'
  | 'Malware Analysis and Defense'
  | 'Computing for Data Analysis: Methods and Tools'
  | 'Computational Science and Engineering Algorithms'
  | 'High Performance Computing'
  | 'Web Search and Text Mining'
  | 'Data and Visual Analytics'
  | 'Big Data Analytics for Healthcare'
  | 'Modeling, Simulation, and Military Gaming'
  | 'Computational Aspects of Cyber Physical Systems'
  | 'Energy Systems Practicum'
  | 'Power Systems Control and Operation'
  | 'Power System Protection'
  | 'Computational Aspects of Cyber Physical Systems'
  | 'Embedded Systems'
  | 'Embedded Systems Security'
  | 'Introduction to Cyber Physical Electric Energy Systems'
  | 'Smart Grids'
  | 'Software Vulnerabilities & Security'
  | 'Introduction to Cyber Physical Systems Security'
  | 'Cyber Physical Design'
  | 'Side-Channels and Their Role in Cybersecurity'
  | 'Introduction to Cyber Physical Electric Energy Systems'
  | 'Principles of Smart Electricity Grids'
  | 'Advanced Hardware Oriented Security and Trust'
  | 'Scenario Writing and Path Gaming'
  | 'International Security'
  | 'Data Analytics and Security'
  | 'Challenge of Terrorism in Democratic Societies'
  | 'Time Series Analysis'
  | 'Nonparametric Data Analysis'
  | 'Design and Analysis of Experiments'
  | 'Statistical Modeling and Regression Analysis'
  | 'Computational Statistics'
  | 'Introduction to Theory and Practice of Bayesian Statistics'
  | 'Introduction to Analytics Modeling'
  | 'Simulation and Modeling for Engineering and Science'
  | 'Probabilistic Models and Their Applications'
  | 'Deterministic Optimization'
  | 'Computational Data Analysis: Learning, Mining, and Computation'
  | 'Data Mining and Statistical Learning'
  | 'High-Dimensional Data Analytics'
  | 'Data Analytics in Business'
  | 'Digital Marketing'
  | 'Privacy for Professionals'
  | 'Applied Analytics Practicum'
  | 'Business Fundamentals for Analytics'
  | 'Financial Modeling'
  | 'Data Analytics and Continuous Improvement'
  | 'Internet and Public Policy'
  | 'Policy Practicum'
  | 'Information Policy and Management'
  | 'Information and Communications Technology Policy'
  | 'Information Security Policies and Strategies';
// | 'Vertically Integrated Projects' // IGNORE -- ambiguous departmentId
