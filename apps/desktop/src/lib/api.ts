import axios from 'axios'
import type { EmployeeFormValues } from '../pages/employees/employee.schema'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})


export function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export type Role = 'ADMIN' | 'OPERATOR'
export type UserRow = { id: string; email: string; role: Role; createdAt: string }

export async function getUsers(token: string | null) {
  const { data } = await api.get<UserRow[]>('/users', { headers: authHeaders(token) })
  return data
}

export async function getUser(token: string | null, id: string) {
  const { data } = await api.get<UserRow>(`/users/${id}`, { headers: authHeaders(token) })
  return data
}

export async function createUserApi(token: string | null, body: { email: string; password: string; role: Role }) {
  const { data } = await api.post('/users', body, { headers: authHeaders(token) })
  return data
}

export async function updateUserApi(token: string | null, id: string, body: Partial<{ email: string; password: string; role: Role }>) {
  const { data } = await api.patch(`/users/${id}`, body, { headers: authHeaders(token) })
  return data
}

export async function deleteUserApi(token: string | null, id: string) {
  const { data } = await api.delete(`/users/${id}`, { headers: authHeaders(token) })
  return data
}

export async function createEmployee(token: string | null, dto: EmployeeFormValues) {
  const { data } = await api.post('/employees', dto, { headers: authHeaders(token) });
  return data
}

export async function updateEmployee(token: string | null, id: string, dto: Partial<EmployeeFormValues>) {
  const { data } = await api.patch(`/employees/${id}`, dto, { headers: authHeaders(token) });
  return data
}

export async function deleteEmployee(token: string | null, id: string) {
  const { data } = await api.delete(`/employees/${id}`, { headers: authHeaders(token) });
  return data
}

export async function getPayrollPreview(token: string | null, id: string) {
  const { data } = await api.get(`/employees/${id}/payroll-preview`, {
    headers: authHeaders(token),
  });
    const toNum = (v: any) => Number(parseFloat(v).toFixed(2));
    return {
      salaryGross: toNum(data.salaryGross),
      employeeEps: toNum(data.employeeEps),
      employerEps: toNum(data.employerEps),
      employeePension: toNum(data.employeePension),
      employerPension: toNum(data.employerPension),
      netSalary: toNum(data.netSalary),
    }
}

export async function getEmployeeCertificate(token: string, id: string) {
  const resp = await fetch(`${import.meta.env.VITE_API_URL}/employees/${id}/certificate`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Error ${resp.status}: ${text}`);
  }

  console.log("Respuesta cruda ->", resp);
  const cd = resp.headers.get('content-disposition') || '';

  const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd || '');
  const filename = decodeURIComponent(m?.[1] || m?.[2] || `certificado.pdf`);
  console.log({ filename });

  const blob = await resp.blob();
  return { blob, filename };
}



