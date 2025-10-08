import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import type { Response } from 'express';
import { Res } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private employees: EmployeesService) { }

  @Get(':id/certificate')
  async getLaborCertificate(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { buffer, contentType, filename } =
      await this.employees.generateLaborCertificatePdf(id);

    res.setHeader('Content-Type', contentType);
    const enc = encodeURIComponent(filename);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"; filename*=UTF-8''${enc}`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    return res.send(buffer);
  }

  @Get('export')
  async export(@Res() res: Response, @Query('search') search?: string) {
    const buffer = await this.employees.exportExcel(search);
    const fileName = `empleados_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(buffer);
  }

  
  @Get()
  list(@Query() q: PaginationDto) {
    return this.employees.list({ search: q.search, page: q.page, size: q.size });
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.employees.get(id); }

  @Roles('ADMIN', 'OPERATOR')
  @Post()
  create(@Body() dto: CreateEmployeeDto, @Req() req: any) {
    return this.employees.create(dto, req.user.userId);
  }

  @Roles('ADMIN', 'OPERATOR')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employees.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.employees.remove(id); }

  @Get(':id/payroll-preview')
  payroll(@Param('id') id: string) { return this.employees.payrollPreview(id); }


}
