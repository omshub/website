import {
	coursesDataStatic,
	departments,
	educationLevels,
	grades,
	programs,
	semesters,
	specializations,
	subjectAreas,
} from '@globals/staticDataModels'
import {
	TCourseId,
	TDepartmentId,
	TEducationLevelId,
	TGradeId,
	TProgramId,
	TSemesterId,
	TSpecializationId,
	TSubjectAreaId,
} from '@globals/types'

/* --- STATIC DATA GETTERS --- */

export const getCoursesDataStatic = () => coursesDataStatic
export const getCourseDataStatic = (courseId: TCourseId) =>
	coursesDataStatic[courseId]

export const getDepartments = () => departments
export const getDepartment = (departmentId: TDepartmentId) =>
	departments[departmentId]

export const getPrograms = () => programs
export const getProgram = (programId: TProgramId) => programs[programId]

export const getSemesters = () => semesters
export const getSemester = (semesterId: TSemesterId) => semesters[semesterId]

export const getSpecializations = () => specializations
export const getSpecialization = (specializationId: TSpecializationId) =>
	specializations[specializationId]

export const getEducationLevels = () => educationLevels
export const getEducationLevel = (educationLevelId: TEducationLevelId) =>
	educationLevels[educationLevelId]

export const getSubjectAreas = () => subjectAreas
export const getSubjectArea = (subjectAreaId: TSubjectAreaId) =>
	subjectAreas[subjectAreaId]

export const getGrades = () => grades
export const getGrade = (gradeId: TGradeId) => grades[gradeId]
