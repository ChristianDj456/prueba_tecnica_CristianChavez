import { IsDateString, IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { BloodType } from '@prisma/client';

export class UpdateEmployeeDto {
  @IsString() @IsOptional() firstName?: string;
  @IsString() @IsOptional() lastName?: string;
  @IsNumberString() @IsOptional() nationalId?: string;
  @IsEnum(BloodType) @IsOptional() bloodType?: BloodType;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() salary?: string;
  @IsString() @IsOptional() arlId?: string;
  @IsString() @IsOptional() epsId?: string;
  @IsString() @IsOptional() pensionFundId?: string;
  @IsOptional()
  @IsDateString()
  terminationDate?: string;
}
