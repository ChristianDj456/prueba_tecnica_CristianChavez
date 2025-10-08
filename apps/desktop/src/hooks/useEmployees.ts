import { useEffect, useMemo, useState, useCallback } from 'react'
import { api, authHeaders, getEmployeeCertificate } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export type Employee = {
    id: string
    firstName: string
    lastName: string
    nationalId: string
    bloodType: string
    phone: string
    salary: string
    arl: { id: string; name: string }
    eps: { id: string; name: string }
    pensionFund: { id: string; name: string }
    createdAt: string
}

type ListResponse = {
    items: Employee[]
    total: number
    page: number
    size: number
    pages: number
}

function sanitizeForFile(name: string) {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim().replace(/\s+/g, '_');
}

export function useEmployees(initialSize = 10) {
    const { token } = useAuth()
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [size, setSize] = useState(initialSize)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<ListResponse | null>(null)
    const [error, setError] = useState<string | null>(null)

    const params = useMemo(() => ({ search, page, size }), [search, page, size])

    const [certOpen, setCertOpen] = useState(false);
    const [certUrl, setCertUrl] = useState<string | null>(null);
    const [certFilename, setCertFilename] = useState('certificado.pdf');
    const [certEmployeeName, setCertEmployeeName] = useState<string>('');
    const [openingId, setOpeningId] = useState<string | null>(null);

    async function fetchEmployees() {
        setLoading(true); setError(null)
        try {
            const { data } = await api.get<ListResponse>('/employees', {
                params,
                headers: authHeaders(token)
            })
            setData(data)
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Error cargando empleados')
        } finally { setLoading(false) }
    }

    useEffect(() => {
        if (token) fetchEmployees()
    }, [search, page, size, token])

    async function exportExcel() {
        await toast.promise(
            (async () => {
                const res = await api.get('/employees/export', {
                    params: { search },
                    headers: authHeaders(token),
                    responseType: 'blob'
                });
                const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `empleados_${new Date().toISOString().slice(0, 10)}.xlsx`;
                document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            })(),
            { loading: 'Generando Excel...', success: 'Descarga iniciada', error: 'No se pudo exportar' }
        );
    }

    const openCertificate = useCallback(async (id: string, token: string, fullName: string) => {
        setCertEmployeeName(fullName);
        await toast.promise(
            (async () => {
                setOpeningId(id);
                const { blob, filename } = await getEmployeeCertificate(token, id);
                const url = URL.createObjectURL(blob);
                // ocultar toolbar: const url = URL.createObjectURL(blob) + '#toolbar=0&navpanes=0';
                setCertUrl(url);
                setCertFilename(filename && filename.toLowerCase().endsWith('.pdf')
                    ? filename
                    : `certificado-${sanitizeForFile(fullName)}.pdf`
                );
                setCertOpen(true);
            })(),
            {
                loading: 'Generando certificado…',
                success: 'Certificado listo',
                error: 'No se pudo generar el certificado',
            }
        ).finally(() => setOpeningId(null));
    }, []);

    const closeCertificate = useCallback(() => {
        setCertOpen(false);
        if (certUrl) {
            URL.revokeObjectURL(certUrl);
            setCertUrl(null);
        }
    }, [certUrl]);

    return {
        data, loading, error, search, setSearch, page, setPage, size, setSize, exportExcel, refresh: fetchEmployees, openCertificate, closeCertificate,
    certOpen, certUrl, certFilename, certEmployeeName, openingId,
    }
}
