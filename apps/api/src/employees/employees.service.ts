import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import ExcelJS = require('exceljs');


@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) { }

  async list(params?: { search?: string; page?: number; size?: number }) {
    const where: Prisma.EmployeeWhereInput | undefined = params?.search
      ? {
        OR: [
          { firstName: { contains: params.search, mode: 'insensitive' } },
          { lastName: { contains: params.search, mode: 'insensitive' } },
          { nationalId: { contains: params.search } },
        ],
      }
      : undefined;

    const page = params?.page ?? 1;
    const size = params?.size ?? 10;
    const skip = (page - 1) * size;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { arl: true, eps: true, pensionFund: true },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      size,
      pages: Math.ceil(total / size),
    };
  }


  async get(id: string) {
    const e = await this.prisma.employee.findUnique({
      where: { id },
      include: { arl: true, eps: true, pensionFund: true },
    });
    if (!e) throw new NotFoundException('Empleado no encontrado');
    return e;
  }

  async create(dto: CreateEmployeeDto, creatorId: string) {
    return this.prisma.employee.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        nationalId: dto.nationalId,
        bloodType: dto.bloodType,
        phone: dto.phone,
        salary: dto.salary,
        arlId: dto.arlId,
        epsId: dto.epsId,
        pensionFundId: dto.pensionFundId,
        createdById: creatorId,
      },
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    try {
      return await this.prisma.employee.update({
        where: { id },
        data: {
          ...dto,
          salary: dto.salary ?? undefined,
        },
      });
    } catch {
      throw new NotFoundException('Empleado no encontrado');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.employee.delete({ where: { id } });
      return { ok: true };
    } catch {
      throw new NotFoundException('Empleado no encontrado');
    }
  }

  async payrollPreview(id: string) {
    const emp = await this.get(id);

    const salary = new Decimal(emp.salary);
    const epsEmployee = salary.mul(0.04);
    const epsEmployer = salary.mul(0.04);
    const pensionEmployee = salary.mul(0.04);
    const pensionEmployer = salary.mul(0.04);
    const netSalary = salary.minus(epsEmployee.plus(pensionEmployee));

    return {
      salaryGross: salary.toFixed(2),
      employeeEps: epsEmployee.toFixed(2),
      employerEps: epsEmployer.toFixed(2),
      employeePension: pensionEmployee.toFixed(2),
      employerPension: pensionEmployer.toFixed(2),
      netSalary: netSalary.toFixed(2),
    };
  }

  async exportExcel(search?: string) {
    const where: Prisma.EmployeeWhereInput | undefined = search
      ? ({
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { nationalId: { contains: search } },
        ],
      } as Prisma.EmployeeWhereInput)
      : undefined;

    const rows = await this.prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { arl: true, eps: true, pensionFund: true }, // ← para e.arl/e.eps/e.pensionFund
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'CRUD Empleados';
    wb.created = new Date();

    const ws = wb.addWorksheet('Empleados');

    ws.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Nombre', key: 'firstName', width: 18 },
      { header: 'Apellido', key: 'lastName', width: 18 },
      { header: 'Cédula', key: 'nationalId', width: 16 },
      { header: 'Tipo de Sangre', key: 'bloodType', width: 14 },
      { header: 'Teléfono', key: 'phone', width: 14 },
      { header: 'ARL', key: 'arl', width: 16 },
      { header: 'EPS', key: 'eps', width: 16 },
      { header: 'Fondo de Pensiones', key: 'pf', width: 22 },
      { header: 'Salario', key: 'salary', width: 14, style: { numFmt: '#,##0.00' } },
      { header: 'EPS Empl. (4%)', key: 'empEps', width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'EPS Empr. (4%)', key: 'emprEps', width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'Pen. Empl. (4%)', key: 'empPen', width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'Pen. Empr. (4%)', key: 'emprPen', width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'Neto Empleado', key: 'net', width: 16, style: { numFmt: '#,##0.00' } },
      { header: 'Creado', key: 'createdAt', width: 19 },
    ];

    const header = ws.getRow(1);
    header.font = { bold: true };
    header.alignment = { vertical: 'middle' };

    for (const e of rows) {
      const salary = new Decimal(e.salary);
      const empEps = salary.mul(0.04);
      const emprEps = salary.mul(0.04);
      const empPen = salary.mul(0.04);
      const emprPen = salary.mul(0.04);
      const net = salary.minus(empEps.plus(empPen));

      ws.addRow({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        nationalId: e.nationalId,
        bloodType: e.bloodType,
        phone: e.phone,
        arl: e.arl.name,
        eps: e.eps.name,
        pf: e.pensionFund.name,
        salary: Number(salary.toFixed(2)),
        empEps: Number(empEps.toFixed(2)),
        emprEps: Number(emprEps.toFixed(2)),
        empPen: Number(empPen.toFixed(2)),
        emprPen: Number(emprPen.toFixed(2)),
        net: Number(net.toFixed(2)),
        createdAt: e.createdAt.toISOString().slice(0, 19).replace('T', ' '),
      });
    }

    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };

    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.border = { bottom: { style: 'hair' } };
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    return buffer;
  }
}
