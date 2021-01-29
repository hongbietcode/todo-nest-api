/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResult } from './interface/login-result.interface';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async Register(register: RegisterDto): Promise<boolean> {
    const user = await this.userModel.findOne({ username: register.username });
    if (user) {
      return false;
    }
    try {
      await new this.userModel(register).save();
      return true;
    } catch {
      return false;
    }
  }

  async Login(login: LoginDto): Promise<LoginResult> {
    const user = await this.userModel.findOne({ username: login.username });

    //define in user/scheme/user.scheme.ts
    const result = await this.userModel['ComparePassword'](
      user,
      login.password,
    );

    //return true
    if (result) {
      return { message: 'login successfully !', token: '' };
    }

    return { message: 'login failed !', token: '' };
  }
}
