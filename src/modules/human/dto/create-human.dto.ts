import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Length } from 'class-validator';
import { IsIdExist } from '~/common/validators/is-id-exist.validator';

export class CreateHumanDto {
    @ApiProperty({ type: 'string', description: 'Mã nhân sự', required: true })
    @IsNotEmpty({ message: 'Mã nhân sự không được để trống' })
    @IsString({ message: 'Mã nhân viên phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Mã nhân sự phải từ 1-255 ký tự' })
    code: string;

    @ApiProperty({ type: 'string', description: 'Họ tên nhân sự', required: true })
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    @IsString({ message: 'Họ tên phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Họ tên phải từ 1-255 ký tự' })
    fullName: string;

    @ApiProperty({ type: 'string', description: 'Mật khẩu', required: true })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @IsString({ message: 'Mật khẩu phải là dạng chuỗi' })
    @Length(1, 255, { message: 'Mật khẩu phải từ 1-255 ký tự' })
    password: string;

    @ApiProperty({ type: 'string', format: 'binary', description: 'Ảnh đại diện', required: false })
    @IsOptional()
    avatar: Express.Multer.File;

    @ApiProperty({ type: 'string', description: 'Email', required: false })
    @IsOptional()
    @IsEmail({}, { message: 'Địa chỉ email không hợp lệ' })
    email: string;

    @ApiProperty({ type: 'string', description: 'Số điện thoại', required: false })
    @IsOptional()
    @IsString({ message: 'Số điện thoại phải là dạng chuỗi' })
    @Length(10, 10, { message: 'Số điện thoại phải có độ dài 10' })
    phoneNumber: string;

    @ApiProperty({ type: 'string', description: 'Tên gọi khác', required: false })
    @IsOptional()
    @IsString({ message: 'Tên gọi khác phải là dạng chuỗi' })
    anotherName: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày sinh', required: false })
    @IsOptional()
    @IsDateString()
    birthDay: Date;

    @ApiProperty({ type: 'number', description: 'Giới tính', required: false })
    @IsOptional()
    @IsNumberString({}, { message: 'Giới tính phải là số' })
    sex: number;

    @ApiProperty({ type: 'string', description: 'Số CCCD', required: false })
    @IsOptional()
    @IsString({ message: 'Số CCCD phải là dạng chuỗi' })
    @Length(12, 12, { message: 'Số CCCD phải có độ dài 12' })
    identityNumber: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày cấp CCCD', required: false })
    @IsOptional()
    @IsDateString()
    identityDate: Date;

    @ApiProperty({ type: 'string', description: 'Nơi cấp CCCD', required: false })
    @IsOptional()
    @IsString({ message: 'Nơi cấp CCCD phải là dạng chuỗi' })
    identityPlace: string;

    @ApiProperty({ type: 'string', description: 'Số hộ chiếu', required: false })
    @IsOptional()
    @IsString({ message: 'Sổ hộ chiếu phải là dạng chuỗi' })
    passportNumber: string;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày cấp hộ chiếu', required: false })
    @IsOptional()
    @IsDateString()
    passportDate: Date;

    @ApiProperty({ type: 'string', description: 'Nơi cấp hộ chiếu', required: false })
    @IsOptional()
    @IsString({ message: 'Nơi cấp hộ chiếu phải là dạng chuỗi' })
    passportPlace: string;

    @ApiProperty({ type: 'string', description: 'Thời hạn hộ chiếu', required: false })
    @IsOptional()
    @IsDateString()
    passportExpired: Date;

    @ApiProperty({ type: 'string', description: 'Nơi sinh', required: false })
    @IsOptional()
    @IsString({ message: 'Nơi sinh phải là dạng chuỗi' })
    placeOfBirth: string;

    @ApiProperty({ type: 'string', description: 'Quốc gia', required: false })
    @IsOptional()
    @IsString({ message: 'Quốc gia phải là dạng chuỗi' })
    nation: string;

    @ApiProperty({ type: 'string', description: 'Tỉnh thành phố', required: false })
    @IsOptional()
    @IsString({ message: 'Tỉnh thành phố phải là dạng chuỗi' })
    province: string;

    @ApiProperty({ type: 'string', description: 'Tôn giáo', required: false })
    @IsOptional()
    @IsString({ message: 'Tôn giáo phải là dạng chuỗi' })
    religion: string;

    @ApiProperty({ type: 'string', description: 'Tình trạng hôn nhân', required: false })
    @IsOptional()
    @IsString({ message: 'Tình trạng hôn nhân phải là dạng chuỗi' })
    maritalStatus: string;

    @ApiProperty({ type: 'number', description: 'Id phòng ban', required: false })
    @IsOptional()
    @IsIdExist({ entity: 'department' }, { message: 'Id phòng ban không tồn tại' })
    departmentId: number;

    @ApiProperty({ type: 'number', description: 'Id chức vụ', required: true })
    @IsNotEmpty({ message: 'Id chức vụ không được để trống' })
    @IsIdExist({ entity: 'position' }, { message: 'Id chức vụ không tồn tại' })
    positionId: number;

    @ApiProperty({ type: 'number', description: 'Quản lý gián tiếp', required: false })
    @IsOptional()
    @IsNumberString()
    indirectSuperior: number;

    @ApiProperty({ type: 'number', description: 'Quản lý trực tiếp', required: false })
    @IsOptional()
    @IsNumberString()
    directSuperior: number;

    @ApiProperty({ type: 'string', format: 'date', description: 'Ngày vào công ty', required: false })
    @IsOptional()
    @IsDateString()
    dateOfJoin: Date;

    @ApiProperty({ type: 'string', description: 'Thông tin hợp đồng', required: false })
    @IsOptional()
    @IsString({ message: 'Thông tin hợp đồng phải là dạng chuỗi' })
    contractInfo: string;

    @ApiProperty({ type: 'string', description: 'Mã số thuế', required: false })
    @IsOptional()
    @IsString({ message: 'Mã số thuế phải là dạng chuỗi' })
    taxCode: string;

    @ApiProperty({ type: 'string', description: 'Số tài khoản ngân hàng', required: false })
    @IsOptional()
    @IsString({ message: 'Số tài khoản ngân hàng phải là dạng chuỗi' })
    bankAccount: string;

    @ApiProperty({ type: 'string', description: 'Tên ngân hàng', required: false })
    @IsOptional()
    @IsString({ message: 'Tên ngân hàng phải là dạng chuỗi' })
    bankName: string;

    @ApiProperty({ type: 'string', description: 'Chi nhánh ngân hàng', required: false })
    @IsOptional()
    @IsString({ message: 'Chi nhánh ngân hàng phải là dạng chuỗi' })
    bankBranch: string;
}
