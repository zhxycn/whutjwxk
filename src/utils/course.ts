export function getCourseId(course: any): string {
  return course.JXBID || course.jxb_id || course.do_jxb_id || course.id;
}

export function getCapacity(course: any): number {
  return (
    course.KCRL ||
    course.JXBRL ||
    course.jxbrl ||
    course.zrs ||
    course.KRL ||
    course.classCapacity ||
    0
  );
}

export function getEnrolled(course: any): number {
  return course.YXRS || course.yxrs || course.numberOfSelected || 0;
}
