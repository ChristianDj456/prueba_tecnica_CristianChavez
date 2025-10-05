export const calculateDeductions = (salary: number) => {
  const epsEmployee = salary * 0.04;
  const pensionEmployee = salary * 0.04;
  const epsEmployer = salary * 0.04;
  const pensionEmployer = salary * 0.04;
  const netSalary = salary - epsEmployee - pensionEmployee;
  return {
    salary,
    epsEmployee,
    pensionEmployee,
    epsEmployer,
    pensionEmployer,
    netSalary
  };
};
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};