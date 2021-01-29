/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResult } from './interface/login-result.interface';
import { Todo, TodoDocument } from './schema/todo.schema';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
    private readonly authService: AuthService,
  ) {}

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
    if (user) {
      //define in user/scheme/user.scheme.ts
      const result = await this.userModel['ComparePassword'](
        user,
        login.password,
      );

      //return true
      if (result) {
        const token = await this.authService.GenerateToken(user);
        return { message: 'login successfully !', token: token };
      }
    }

    return { message: 'username or password incorrect !', token: '' };
  }

  async AddTodo(content: string, userId: string): Promise<{ message: string }> {
    try {
      const todoItem: Todo = {
        userId: userId,
        content: content,
        isComplete: false,
      };
      await new this.todoModel(todoItem).save();

      return { message: 'ok' };
    } catch {
      return { message: 'failed' };
    }
  }

  async GetTodoList(userId: string): Promise<TodoDocument[]> {
    return this.todoModel['findByUserID'](userId);
  }
}
