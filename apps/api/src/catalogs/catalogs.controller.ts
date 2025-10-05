import { Controller, Get, UseGuards } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('catalogs')
export class CatalogsController {
  constructor(private catalogs: CatalogsService) {}

  @Get('arl') getArl() { return this.catalogs.arl(); }
  @Get('eps') getEps() { return this.catalogs.eps(); }
  @Get('pension-funds') getPension() { return this.catalogs.pension(); }
}
