import { invoke } from "@tauri-apps/api/core";

export const getCaptcha = () => invoke("get_captcha", {});

export const login = (
  loginname: string,
  password: string,
  captcha: string,
  uuid: string,
) => invoke("login", { loginname, password, captcha, uuid });

export const checkSession = () => invoke("check_session", {});

export const getCourseList = (
  batchCode: string,
  classType: string,
  page: number,
) => invoke("get_course_list", { batchCode, classType, page });

export const grabCourse = (
  clazzId: string,
  secretVal: string,
  batchId: string,
  clazzType: string,
) => invoke("grab_course", { clazzId, secretVal, batchId, clazzType });

export const getSelectedCourses = (batchId: string) =>
  invoke("get_selected_courses", { batchId });

export const dropCourse = (
  clazzId: string,
  secretVal: string,
  batchId: string,
) => invoke("drop_course", { clazzId, secretVal, batchId });

export const getClassTypes = (batchId: string) =>
  invoke("get_class_types", { batchId });
