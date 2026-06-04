import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { AddressDto } from './dto/address.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@Req() req) {
    return this.users.getProfile(req.user.userId);
  }

  @Get('me/addresses')
  addresses(@Req() req) {
    return this.users.listAddresses(req.user.userId);
  }

  @Post('me/addresses')
  addAddress(@Req() req, @Body() dto: AddressDto) {
    return this.users.addAddress(req.user.userId, dto);
  }

  @Delete('me/addresses/:id')
  removeAddress(@Req() req, @Param('id') id: string) {
    return this.users.removeAddress(req.user.userId, id);
  }
}
