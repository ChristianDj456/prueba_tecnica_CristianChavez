import { IsDateString, IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { BloodType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsNumberString() nationalId!: string;
  @IsEnum(BloodType) bloodType!: BloodType;
  @IsString() phone!: string;
  @IsString() salary!: string;
  @IsString() arlId!: string;
  @IsString() epsId!: string;
  @IsString() pensionFundId!: string;
  @IsOptional() @IsString() createdById?: string;

  @IsOptional()
  @IsDateString()
  terminationDate?: string;
}
