import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import ExcelJS = require('exceljs');
import PDFDocument = require('pdfkit');


function sanitizeFileName(name: string) {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim().replace(/\s+/g, '_');
}

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
        terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : null,
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
          terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : null,
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
      { header: 'Total Costo Empleador', key: 'total', width: 20, style: { numFmt: '#,##0.00' } },
      { header: 'Fecha Retiro', key: 'terminationDate', width: 20 },
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
      const arl = salary.mul(0.00522);
      const net = salary.minus(empEps.plus(empPen));
      const totalCost = salary.plus(emprEps).plus(emprPen).plus(arl);

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
        total: Number(totalCost.toFixed(2)), 
        terminationDate: e.terminationDate
    ? e.terminationDate.toISOString().slice(0, 19).replace('T', ' ')
    : 'Activo',
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


  async generateLaborCertificatePdf(id: string): Promise<{
    filename: string;
    buffer: Buffer;
    contentType: string;
  }> {
    const emp = await this.get(id);

    const today = new Date();
    let status = 'ACTIVO';
    let inactiveDays = 0;

    if (emp.terminationDate && emp.terminationDate <= today) {
      status = 'INACTIVO';
      const diffMs = today.getTime() - emp.terminationDate.getTime();
      inactiveDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    const fmtCurrency = (v: any) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(Number(v));

    const fmtDate = (d?: Date | null) =>
      d ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(d) : 'N/A';

    // --- Construcción del PDF ---
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    // recolectar en buffer
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const bufferPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Encabezado / datos de la empresa
    const company = {
      name: 'ACME S.A.S.',
      nit: '900.123.456-7',
      address: 'Calle 123 #45-67, Bogotá D.C.',
    };

    // Contenido
    doc.fontSize(16).text('CERTIFICADO LABORAL', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(10).text(company.name);
    doc.text(`NIT: ${company.nit}`);
    doc.text(`Dirección: ${company.address}`);
    doc.text(`Fecha de emisión: ${fmtDate(today)}`);
    doc.moveDown(1.2);

    const fullName = `${emp.firstName} ${emp.lastName}`.trim();
    const paragraph =
      status === 'ACTIVO'
        ? `Por medio de la presente se certifica que el(la) señor(a) ${fullName}, identificado(a) con cédula de ciudadanía No. ${emp.nationalId}, labora actualmente en ${company.name} a la fecha de emisión de este certificado.`
        : `Por medio de la presente se certifica que el(la) señor(a) ${fullName}, identificado(a) con cédula de ciudadanía No. ${emp.nationalId}, laboró en ${company.name} hasta el ${fmtDate(emp.terminationDate)}. A la fecha, acumula ${inactiveDays} día(s) de inactividad.`;

    doc.fontSize(12).text(paragraph, { align: 'justify' });
    doc.moveDown(0.8);

    doc.fontSize(11).text(`Estado: ${status}`);
    doc.text(`Salario: ${fmtCurrency(emp.salary)}`);
    doc.text(`Fecha de ingreso: ${fmtDate(emp.createdAt)}`);
    doc.text(`Fecha de retiro: ${fmtDate(emp.terminationDate ?? null)}`);
    doc.text(`EPS: ${emp.eps?.name ?? 'N/A'}`);
    doc.text(`ARL: ${emp.arl?.name ?? 'N/A'}`);
    doc.text(`Fondo de Pensiones: ${emp.pensionFund?.name ?? 'N/A'}`);
    doc.moveDown(1);

    doc.fontSize(10).text(
      'Este certificado se expide a solicitud del interesado para los fines que considere pertinentes.',
      { align: 'justify' },
    );

    doc.moveDown(3);
    doc.text('Atentamente,').moveDown(2);
    doc.text('____________________________');
    doc.text(`Recursos Humanos - ${company.name}`);

    doc.end();

    const buffer = await bufferPromise;

    const pretty = sanitizeFileName(fullName);
    const filename = `certificado-${pretty}.pdf`;   


    return {
      filename,
      buffer,
      contentType: 'application/pdf',
    };
  }

}
