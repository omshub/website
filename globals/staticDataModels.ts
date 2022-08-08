import {
	TPayloadDepartments,
	TPayloadEducationLevels,
	TPayloadGrades,
	TPayloadPrograms,
	TPayloadSemesters,
	TPayloadSpecializations,
	TPayloadSubjectAreas,
} from '@globals/types'

export const departments: TPayloadDepartments = {
	CS: {
		departmentId: 'CS',
		name: 'Computer Science',
		url: 'https://www.scs.gatech.edu/',
	},
	CSE: {
		departmentId: 'CSE',
		name: 'Computational Science and Engineering',
		url: 'https://www.cse.gatech.edu/',
	},
	ECE: {
		departmentId: 'ECE',
		name: 'Electrical and Computer Engineering',
		url: 'https://ece.gatech.edu/',
	},
	INTA: {
		departmentId: 'INTA',
		name: 'International Affairs',
		url: 'https://inta.gatech.edu/',
	},
	ISYE: {
		departmentId: 'ISYE',
		name: 'Industrial and Systems Engineering',
		url: 'https://isye.gatech.edu/',
	},
	MGT: {
		departmentId: 'MGT',
		name: 'Management',
		url: 'https://www.scheller.gatech.edu/',
	},
	PUBP: {
		departmentId: 'PUBP',
		name: 'Public Policy',
		url: 'https://spp.gatech.edu/',
	},
}

export const programs: TPayloadPrograms = {
	a: {
		programId: 'a',
		name: 'Analytics',
		url: 'https://pe.gatech.edu/degrees/analytics',
	},
	cs: {
		programId: 'cs',
		name: 'Computer Science',
		url: 'https://pe.gatech.edu/degrees/computer-science',
	},
	cy: {
		programId: 'cy',
		name: 'Cybersecurity',
		url: 'https://pe.gatech.edu/degrees/cybersecurity',
	},
}

export const semesters: TPayloadSemesters = {
	sp: { semesterId: 'sp', term: 1, name: 'Spring' },
	sm: { semesterId: 'sm', term: 2, name: 'Summer' },
	fa: { semesterId: 'fa', term: 3, name: 'Fall' },
}

export const specializations: TPayloadSpecializations = {
	'a:at': {
		specializationId: 'a:at',
		name: 'Analytical Tools',
		programId: 'a',
	},
	'a:ba': {
		specializationId: 'a:ba',
		name: 'Business Analytics',
		programId: 'a',
	},
	'a:cda': {
		specializationId: 'a:cda',
		name: 'Computational Data Analytics',
		programId: 'a',
	},
	'cs:cpr': {
		specializationId: 'cs:cpr',
		name: 'Computational Perception and Robotics',
		programId: 'cs',
	},
	'cs:cs': {
		specializationId: 'cs:cs',
		name: 'Computing Systems',
		programId: 'cs',
	},
	'cs:ii': {
		specializationId: 'cs:ii',
		name: 'Interactive Intelligence',
		programId: 'cs',
	},
	'cs:ml': {
		specializationId: 'cs:ml',
		name: 'Machine Learning',
		programId: 'cs',
	},
	'cy:es': {
		specializationId: 'cy:es',
		name: 'Energy Systems',
		programId: 'cy',
	},
	'cy:is': {
		specializationId: 'cy:is',
		name: 'Information Security',
		programId: 'cy',
	},
	'cy:pol': { specializationId: 'cy:pol', name: 'Policy', programId: 'cy' },
}

export const educationLevels: TPayloadEducationLevels = {
	bach: { educationLevelId: 'bach', name: 'Bachelor' },
	mast: { educationLevelId: 'mast', name: 'Master' },
	doc: { educationLevelId: 'phd', name: 'Doctorate (PhD)' },
}

export const subjectAreas: TPayloadSubjectAreas = {
	act: { subjectAreaId: 'act', name: 'Actuarial Science' },
	bus: {
		subjectAreaId: 'bus',
		name: 'Business - Other/General (Accounting, etc.)',
	},
	cs: { subjectAreaId: 'cs', name: 'Computer Science' },
	econ: { subjectAreaId: 'econ', name: 'Economics' },
	engrElec: { subjectAreaId: 'engrElec', name: 'Electrical Engineering' },
	engrCmp: { subjectAreaId: 'engrComp', name: 'Computer Engineering' },
	engrInd: { subjectAreaId: 'engrInd', name: 'Industrial Engineering' },
	engrOther: { subjectAreaId: 'engrOther', name: 'Other Engineering' },
	fin: { subjectAreaId: 'fin', name: 'Finance' },
	hlt: {
		subjectAreaId: 'hlt',
		name: 'Health or Healthcare-Related (PA, Dentistry, etc.)',
	},
	human: { subjectAreaId: 'human', name: 'Humanities' },
	it: { subjectAreaId: 'it', name: 'Information Technology' },
	law: { subjectAreaId: 'law', name: 'Law/Legal' },
	libArts: { subjectAreaId: 'libArts', name: 'Liberal Arts' },
	med: { subjectAreaId: 'med', name: 'Medicine or Premed' },
	mis: { subjectAreaId: 'mis', name: 'Management Information Systems' },
	math: { subjectAreaId: 'math', name: 'Mathematics' },
	natSci: {
		subjectAreaId: 'natSci',
		name: 'Natural Sciences (Biology, Chemistry, etc.)',
	},
	stats: { subjectAreaId: 'stats', name: 'Statistics' },
	or: { subjectAreaId: 'or', name: 'Operations Research' },
	phil: { subjectAreaId: 'phil', name: 'Philosophy' },
	phys: { subjectAreaId: 'phys', name: 'Physics' },
	zzOther: { subjectAreaId: 'zzOther', name: 'Other / Not Listed' },
}

export const grades: TPayloadGrades = {
	unk: { gradeId: 'unk', name: 'Prefer not to say' },
	w: { gradeId: 'w', name: 'W (Withdrawal)' },
	f: { gradeId: 'f', name: 'F' },
	d: { gradeId: 'd', name: 'D' },
	c: { gradeId: 'c', name: 'C' },
	b: { gradeId: 'b', name: 'B' },
	a: { gradeId: 'a', name: 'A' },
}
