export interface Campus {
  code: string;
  name: string;
}

export const CAMPUS_LIST: Campus[] = [
  { code: "01", name: "马房山校区" },
  { code: "02", name: "南湖校区" },
  { code: "03", name: "余家头校区" },
  { code: "05", name: "军山校区" },
];

export const getCampusName = (code: string) =>
  CAMPUS_LIST.find((c) => c.code === code)?.name || code;
