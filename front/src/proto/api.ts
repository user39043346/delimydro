/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import * as _m0 from "protobufjs/minimal";
import { Timestamp } from "./google/protobuf/timestamp";
import Long from "long";

export const protobufPackage = "api";

export interface Token {
  token: string;
}

export interface Empty {
}

export interface GetGroupDebtsRequest {
  groupId: string;
}

export interface GetGroupDebtsResponse {
  debts: Debt[];
}

export interface SearchGroupRequest {
  inviteCode: string;
}

export interface SearchGroupResponse {
  group: Group | undefined;
}

export interface RegisterRequest {
  username: string;
  password: string;
  imagePath: string;
}

export interface RegisterResponse {
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface AddFriendRequest {
  code: string;
}

export interface ListMyFriendsResponse {
  friends: User[];
}

export interface SearchFriendRequest {
  prefix: string;
}

export interface SearchFriendResponse {
  friends: User[];
}

export interface SearchUserRequest {
  code: string;
}

export interface SearchUserResponse {
  user: User | undefined;
}

export interface CreateFriendExpenseRequest {
  friendId: string;
  expenseName: string;
  amount: number;
  friendIsDebtor: boolean;
}

export interface DeleteFriendExpenseRequest {
  expenseId: string;
  friendId: string;
}

export interface Expense {
  id: string;
  name: string;
  payerName: string;
  payerImagePath: string;
  debtorName: string;
  totalPaid: number;
  type: number;
  myDiff: number;
  time: Date | undefined;
}

export interface ListFriendsExpensesRequest {
  n: number;
  offset: number;
}

export interface ListFriendsExpensesResponse {
  expenses: Expense[];
}

export interface FriendSettleUpRequest {
  friendId: string;
  amount: number;
  friendPays: boolean;
}

export interface User {
  id: string;
  username: string;
  imagePath: string;
  balance: number;
  code: string;
}

export interface GetUsersWithOutstandingBalanceResponse {
  debtors: User[];
  payers: User[];
}

export interface GetUserGroupsDistributionRequest {
  userId: string;
}

export interface Group {
  id: string;
  name: string;
  imagePath: string;
  balance: number;
  type: number;
  inviteCode: string;
}

export interface GetUserGroupsDistributionResponse {
  userIsDebtor: Group[];
  userIsPayer: Group[];
  nonGroupBalance: number;
}

export interface Diff {
  userId: string;
  diff: number;
}

export interface SearchGroupMemberRequest {
  groupId: string;
  prefix: string;
}

export interface SearchGroupMemberResponse {
  users: User[];
}

export interface CreateGroupExpenseRequest {
  groupId: string;
  expenseName: string;
  payers: Diff[];
  debtors: Diff[];
}

export interface DeleteGroupExpenseRequest {
  expenseId: string;
  groupId: string;
}

export interface ListGroupExpensesRequest {
  n: number;
  offset: number;
  groupId: string;
}

export interface ListGroupExpensesResponse {
  expenses: Expense[];
}

export interface GetGroupBalancesRequest {
  groupId: string;
}

export interface GetGroupBalancesResponse {
  users: User[];
}

export interface AddUsersToGroupRequest {
  groupId: string;
  usersIds: string[];
}

export interface GetGroupUsersRequest {
  groupId: string;
}

export interface GetGroupUsersResponse {
  users: User[];
}

export interface CreateGroupRequest {
  name: string;
  imagePath: string;
  type: number;
  usersIds: string[];
}

export interface CreateGroupResponse {
  groupId: string;
}

export interface DeleteGroupRequest {
  groupId: string;
}

export interface GetGroupRequest {
  groupId: string;
}

export interface GetGroupResponse {
  group: Group | undefined;
}

export interface ChangeGroupTypeRequest {
  groupId: string;
  newType: number;
}

export interface Debt {
  payerId: string;
  debtorId: string;
  amount: number;
}

export interface GroupSettleUpRequest {
  groupId: string;
  debt: Debt | undefined;
}

export interface GetUserPayersDebtorsInGroupRequest {
  groupId: string;
  userId: string;
}

export interface GetUserPayersDebtorsInGroupResponse {
  debtors: User[];
  payers: User[];
}

export interface CheckUserInGroupRequest {
  groupId: string;
  userId: string;
}

export interface CheckUserInGroupResponse {
  result: boolean;
}

export interface MyProfileResponse {
  user: User | undefined;
  groups: Group[];
  friends: User[];
}

export interface ListMyGroupsResponse {
  groups: Group[];
}

export interface LeaveGroupRequest {
  groupId: string;
}

export interface JoinGroupRequest {
  inviteCode: string;
}

export interface ExpenseInfoRequest {
  expenseId: string;
}

export interface ExpenseInfoResponse {
  usersDistribution: Debt[];
}

function createBaseToken(): Token {
  return { token: "" };
}

export const Token = {
  encode(message: Token, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Token {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseToken();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.token = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Token>): Token {
    return Token.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Token>): Token {
    const message = createBaseToken();
    message.token = object.token ?? "";
    return message;
  },
};

function createBaseEmpty(): Empty {
  return {};
}

export const Empty = {
  encode(_: Empty, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Empty {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEmpty();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Empty>): Empty {
    return Empty.fromPartial(base ?? {});
  },
  fromPartial(_: DeepPartial<Empty>): Empty {
    const message = createBaseEmpty();
    return message;
  },
};

function createBaseGetGroupDebtsRequest(): GetGroupDebtsRequest {
  return { groupId: "" };
}

export const GetGroupDebtsRequest = {
  encode(message: GetGroupDebtsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGroupDebtsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGroupDebtsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGroupDebtsRequest>): GetGroupDebtsRequest {
    return GetGroupDebtsRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGroupDebtsRequest>): GetGroupDebtsRequest {
    const message = createBaseGetGroupDebtsRequest();
    message.groupId = object.groupId ?? "";
    return message;
  },
};

function createBaseGetGroupDebtsResponse(): GetGroupDebtsResponse {
  return { debts: [] };
}

export const GetGroupDebtsResponse = {
  encode(message: GetGroupDebtsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.debts) {
      Debt.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGroupDebtsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGroupDebtsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.debts.push(Debt.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGroupDebtsResponse>): GetGroupDebtsResponse {
    return GetGroupDebtsResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGroupDebtsResponse>): GetGroupDebtsResponse {
    const message = createBaseGetGroupDebtsResponse();
    message.debts = object.debts?.map((e) => Debt.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSearchGroupRequest(): SearchGroupRequest {
  return { inviteCode: "" };
}

export const SearchGroupRequest = {
  encode(message: SearchGroupRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.inviteCode !== "") {
      writer.uint32(10).string(message.inviteCode);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchGroupRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchGroupRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.inviteCode = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SearchGroupRequest>): SearchGroupRequest {
    return SearchGroupRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchGroupRequest>): SearchGroupRequest {
    const message = createBaseSearchGroupRequest();
    message.inviteCode = object.inviteCode ?? "";
    return message;
  },
};

function createBaseSearchGroupResponse(): SearchGroupResponse {
  return { group: undefined };
}

export const SearchGroupResponse = {
  encode(message: SearchGroupResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.group !== undefined) {
      Group.encode(message.group, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchGroupResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchGroupResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.group = Group.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SearchGroupResponse>): SearchGroupResponse {
    return SearchGroupResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchGroupResponse>): SearchGroupResponse {
    const message = createBaseSearchGroupResponse();
    message.group = (object.group !== undefined && object.group !== null) ? Group.fromPartial(object.group) : undefined;
    return message;
  },
};

function createBaseRegisterRequest(): RegisterRequest {
  return { username: "", password: "", imagePath: "" };
}

export const RegisterRequest = {
  encode(message: RegisterRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.password !== "") {
      writer.uint32(18).string(message.password);
    }
    if (message.imagePath !== "") {
      writer.uint32(26).string(message.imagePath);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegisterRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.username = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.password = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.imagePath = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<RegisterRequest>): RegisterRequest {
    return RegisterRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RegisterRequest>): RegisterRequest {
    const message = createBaseRegisterRequest();
    message.username = object.username ?? "";
    message.password = object.password ?? "";
    message.imagePath = object.imagePath ?? "";
    return message;
  },
};

function createBaseRegisterResponse(): RegisterResponse {
  return { token: "" };
}

export const RegisterResponse = {
  encode(message: RegisterResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRegisterResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.token = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<RegisterResponse>): RegisterResponse {
    return RegisterResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<RegisterResponse>): RegisterResponse {
    const message = createBaseRegisterResponse();
    message.token = object.token ?? "";
    return message;
  },
};

function createBaseLoginRequest(): LoginRequest {
  return { username: "", password: "" };
}

export const LoginRequest = {
  encode(message: LoginRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.username !== "") {
      writer.uint32(10).string(message.username);
    }
    if (message.password !== "") {
      writer.uint32(18).string(message.password);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LoginRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLoginRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.username = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.password = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<LoginRequest>): LoginRequest {
    return LoginRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LoginRequest>): LoginRequest {
    const message = createBaseLoginRequest();
    message.username = object.username ?? "";
    message.password = object.password ?? "";
    return message;
  },
};

function createBaseLoginResponse(): LoginResponse {
  return { token: "" };
}

export const LoginResponse = {
  encode(message: LoginResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LoginResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLoginResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.token = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<LoginResponse>): LoginResponse {
    return LoginResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LoginResponse>): LoginResponse {
    const message = createBaseLoginResponse();
    message.token = object.token ?? "";
    return message;
  },
};

function createBaseAddFriendRequest(): AddFriendRequest {
  return { code: "" };
}

export const AddFriendRequest = {
  encode(message: AddFriendRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== "") {
      writer.uint32(10).string(message.code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AddFriendRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAddFriendRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.code = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<AddFriendRequest>): AddFriendRequest {
    return AddFriendRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AddFriendRequest>): AddFriendRequest {
    const message = createBaseAddFriendRequest();
    message.code = object.code ?? "";
    return message;
  },
};

function createBaseListMyFriendsResponse(): ListMyFriendsResponse {
  return { friends: [] };
}

export const ListMyFriendsResponse = {
  encode(message: ListMyFriendsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.friends) {
      User.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListMyFriendsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListMyFriendsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.friends.push(User.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ListMyFriendsResponse>): ListMyFriendsResponse {
    return ListMyFriendsResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListMyFriendsResponse>): ListMyFriendsResponse {
    const message = createBaseListMyFriendsResponse();
    message.friends = object.friends?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSearchFriendRequest(): SearchFriendRequest {
  return { prefix: "" };
}

export const SearchFriendRequest = {
  encode(message: SearchFriendRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.prefix !== "") {
      writer.uint32(10).string(message.prefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchFriendRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchFriendRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.prefix = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SearchFriendRequest>): SearchFriendRequest {
    return SearchFriendRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchFriendRequest>): SearchFriendRequest {
    const message = createBaseSearchFriendRequest();
    message.prefix = object.prefix ?? "";
    return message;
  },
};

function createBaseSearchFriendResponse(): SearchFriendResponse {
  return { friends: [] };
}

export const SearchFriendResponse = {
  encode(message: SearchFriendResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.friends) {
      User.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchFriendResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchFriendResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          if (tag !== 18) {
            break;
          }

          message.friends.push(User.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SearchFriendResponse>): SearchFriendResponse {
    return SearchFriendResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchFriendResponse>): SearchFriendResponse {
    const message = createBaseSearchFriendResponse();
    message.friends = object.friends?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSearchUserRequest(): SearchUserRequest {
  return { code: "" };
}

export const SearchUserRequest = {
  encode(message: SearchUserRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== "") {
      writer.uint32(10).string(message.code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchUserRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchUserRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.code = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SearchUserRequest>): SearchUserRequest {
    return SearchUserRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchUserRequest>): SearchUserRequest {
    const message = createBaseSearchUserRequest();
    message.code = object.code ?? "";
    return message;
  },
};

function createBaseSearchUserResponse(): SearchUserResponse {
  return { user: undefined };
}

export const SearchUserResponse = {
  encode(message: SearchUserResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchUserResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchUserResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SearchUserResponse>): SearchUserResponse {
    return SearchUserResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchUserResponse>): SearchUserResponse {
    const message = createBaseSearchUserResponse();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    return message;
  },
};

function createBaseCreateFriendExpenseRequest(): CreateFriendExpenseRequest {
  return { friendId: "", expenseName: "", amount: 0, friendIsDebtor: false };
}

export const CreateFriendExpenseRequest = {
  encode(message: CreateFriendExpenseRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.friendId !== "") {
      writer.uint32(10).string(message.friendId);
    }
    if (message.expenseName !== "") {
      writer.uint32(18).string(message.expenseName);
    }
    if (message.amount !== 0) {
      writer.uint32(24).int64(message.amount);
    }
    if (message.friendIsDebtor === true) {
      writer.uint32(32).bool(message.friendIsDebtor);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateFriendExpenseRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateFriendExpenseRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.friendId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.expenseName = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.amount = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.friendIsDebtor = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CreateFriendExpenseRequest>): CreateFriendExpenseRequest {
    return CreateFriendExpenseRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CreateFriendExpenseRequest>): CreateFriendExpenseRequest {
    const message = createBaseCreateFriendExpenseRequest();
    message.friendId = object.friendId ?? "";
    message.expenseName = object.expenseName ?? "";
    message.amount = object.amount ?? 0;
    message.friendIsDebtor = object.friendIsDebtor ?? false;
    return message;
  },
};

function createBaseDeleteFriendExpenseRequest(): DeleteFriendExpenseRequest {
  return { expenseId: "", friendId: "" };
}

export const DeleteFriendExpenseRequest = {
  encode(message: DeleteFriendExpenseRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.expenseId !== "") {
      writer.uint32(10).string(message.expenseId);
    }
    if (message.friendId !== "") {
      writer.uint32(18).string(message.friendId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteFriendExpenseRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteFriendExpenseRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.expenseId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.friendId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<DeleteFriendExpenseRequest>): DeleteFriendExpenseRequest {
    return DeleteFriendExpenseRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DeleteFriendExpenseRequest>): DeleteFriendExpenseRequest {
    const message = createBaseDeleteFriendExpenseRequest();
    message.expenseId = object.expenseId ?? "";
    message.friendId = object.friendId ?? "";
    return message;
  },
};

function createBaseExpense(): Expense {
  return {
    id: "",
    name: "",
    payerName: "",
    payerImagePath: "",
    debtorName: "",
    totalPaid: 0,
    type: 0,
    myDiff: 0,
    time: undefined,
  };
}

export const Expense = {
  encode(message: Expense, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.payerName !== "") {
      writer.uint32(26).string(message.payerName);
    }
    if (message.payerImagePath !== "") {
      writer.uint32(34).string(message.payerImagePath);
    }
    if (message.debtorName !== "") {
      writer.uint32(42).string(message.debtorName);
    }
    if (message.totalPaid !== 0) {
      writer.uint32(48).int64(message.totalPaid);
    }
    if (message.type !== 0) {
      writer.uint32(56).int64(message.type);
    }
    if (message.myDiff !== 0) {
      writer.uint32(64).int64(message.myDiff);
    }
    if (message.time !== undefined) {
      Timestamp.encode(toTimestamp(message.time), writer.uint32(74).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Expense {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExpense();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.payerName = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.payerImagePath = reader.string();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.debtorName = reader.string();
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.totalPaid = longToNumber(reader.int64() as Long);
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.type = longToNumber(reader.int64() as Long);
          continue;
        case 8:
          if (tag !== 64) {
            break;
          }

          message.myDiff = longToNumber(reader.int64() as Long);
          continue;
        case 9:
          if (tag !== 74) {
            break;
          }

          message.time = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Expense>): Expense {
    return Expense.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Expense>): Expense {
    const message = createBaseExpense();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.payerName = object.payerName ?? "";
    message.payerImagePath = object.payerImagePath ?? "";
    message.debtorName = object.debtorName ?? "";
    message.totalPaid = object.totalPaid ?? 0;
    message.type = object.type ?? 0;
    message.myDiff = object.myDiff ?? 0;
    message.time = object.time ?? undefined;
    return message;
  },
};

function createBaseListFriendsExpensesRequest(): ListFriendsExpensesRequest {
  return { n: 0, offset: 0 };
}

export const ListFriendsExpensesRequest = {
  encode(message: ListFriendsExpensesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.n !== 0) {
      writer.uint32(8).int64(message.n);
    }
    if (message.offset !== 0) {
      writer.uint32(16).int64(message.offset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListFriendsExpensesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListFriendsExpensesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.n = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.offset = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ListFriendsExpensesRequest>): ListFriendsExpensesRequest {
    return ListFriendsExpensesRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListFriendsExpensesRequest>): ListFriendsExpensesRequest {
    const message = createBaseListFriendsExpensesRequest();
    message.n = object.n ?? 0;
    message.offset = object.offset ?? 0;
    return message;
  },
};

function createBaseListFriendsExpensesResponse(): ListFriendsExpensesResponse {
  return { expenses: [] };
}

export const ListFriendsExpensesResponse = {
  encode(message: ListFriendsExpensesResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.expenses) {
      Expense.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListFriendsExpensesResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListFriendsExpensesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.expenses.push(Expense.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ListFriendsExpensesResponse>): ListFriendsExpensesResponse {
    return ListFriendsExpensesResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListFriendsExpensesResponse>): ListFriendsExpensesResponse {
    const message = createBaseListFriendsExpensesResponse();
    message.expenses = object.expenses?.map((e) => Expense.fromPartial(e)) || [];
    return message;
  },
};

function createBaseFriendSettleUpRequest(): FriendSettleUpRequest {
  return { friendId: "", amount: 0, friendPays: false };
}

export const FriendSettleUpRequest = {
  encode(message: FriendSettleUpRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.friendId !== "") {
      writer.uint32(10).string(message.friendId);
    }
    if (message.amount !== 0) {
      writer.uint32(16).int64(message.amount);
    }
    if (message.friendPays === true) {
      writer.uint32(24).bool(message.friendPays);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FriendSettleUpRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFriendSettleUpRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.friendId = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.amount = longToNumber(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.friendPays = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<FriendSettleUpRequest>): FriendSettleUpRequest {
    return FriendSettleUpRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<FriendSettleUpRequest>): FriendSettleUpRequest {
    const message = createBaseFriendSettleUpRequest();
    message.friendId = object.friendId ?? "";
    message.amount = object.amount ?? 0;
    message.friendPays = object.friendPays ?? false;
    return message;
  },
};

function createBaseUser(): User {
  return { id: "", username: "", imagePath: "", balance: 0, code: "" };
}

export const User = {
  encode(message: User, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.username !== "") {
      writer.uint32(18).string(message.username);
    }
    if (message.imagePath !== "") {
      writer.uint32(26).string(message.imagePath);
    }
    if (message.balance !== 0) {
      writer.uint32(32).int64(message.balance);
    }
    if (message.code !== "") {
      writer.uint32(42).string(message.code);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): User {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.username = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.imagePath = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.balance = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.code = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<User>): User {
    return User.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<User>): User {
    const message = createBaseUser();
    message.id = object.id ?? "";
    message.username = object.username ?? "";
    message.imagePath = object.imagePath ?? "";
    message.balance = object.balance ?? 0;
    message.code = object.code ?? "";
    return message;
  },
};

function createBaseGetUsersWithOutstandingBalanceResponse(): GetUsersWithOutstandingBalanceResponse {
  return { debtors: [], payers: [] };
}

export const GetUsersWithOutstandingBalanceResponse = {
  encode(message: GetUsersWithOutstandingBalanceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.debtors) {
      User.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.payers) {
      User.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetUsersWithOutstandingBalanceResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUsersWithOutstandingBalanceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.debtors.push(User.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.payers.push(User.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetUsersWithOutstandingBalanceResponse>): GetUsersWithOutstandingBalanceResponse {
    return GetUsersWithOutstandingBalanceResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetUsersWithOutstandingBalanceResponse>): GetUsersWithOutstandingBalanceResponse {
    const message = createBaseGetUsersWithOutstandingBalanceResponse();
    message.debtors = object.debtors?.map((e) => User.fromPartial(e)) || [];
    message.payers = object.payers?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetUserGroupsDistributionRequest(): GetUserGroupsDistributionRequest {
  return { userId: "" };
}

export const GetUserGroupsDistributionRequest = {
  encode(message: GetUserGroupsDistributionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.userId !== "") {
      writer.uint32(10).string(message.userId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetUserGroupsDistributionRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUserGroupsDistributionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.userId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetUserGroupsDistributionRequest>): GetUserGroupsDistributionRequest {
    return GetUserGroupsDistributionRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetUserGroupsDistributionRequest>): GetUserGroupsDistributionRequest {
    const message = createBaseGetUserGroupsDistributionRequest();
    message.userId = object.userId ?? "";
    return message;
  },
};

function createBaseGroup(): Group {
  return { id: "", name: "", imagePath: "", balance: 0, type: 0, inviteCode: "" };
}

export const Group = {
  encode(message: Group, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.imagePath !== "") {
      writer.uint32(26).string(message.imagePath);
    }
    if (message.balance !== 0) {
      writer.uint32(32).int64(message.balance);
    }
    if (message.type !== 0) {
      writer.uint32(40).int64(message.type);
    }
    if (message.inviteCode !== "") {
      writer.uint32(50).string(message.inviteCode);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Group {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroup();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.imagePath = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.balance = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.type = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.inviteCode = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Group>): Group {
    return Group.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Group>): Group {
    const message = createBaseGroup();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.imagePath = object.imagePath ?? "";
    message.balance = object.balance ?? 0;
    message.type = object.type ?? 0;
    message.inviteCode = object.inviteCode ?? "";
    return message;
  },
};

function createBaseGetUserGroupsDistributionResponse(): GetUserGroupsDistributionResponse {
  return { userIsDebtor: [], userIsPayer: [], nonGroupBalance: 0 };
}

export const GetUserGroupsDistributionResponse = {
  encode(message: GetUserGroupsDistributionResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.userIsDebtor) {
      Group.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.userIsPayer) {
      Group.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.nonGroupBalance !== 0) {
      writer.uint32(24).int64(message.nonGroupBalance);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetUserGroupsDistributionResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUserGroupsDistributionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.userIsDebtor.push(Group.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.userIsPayer.push(Group.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.nonGroupBalance = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetUserGroupsDistributionResponse>): GetUserGroupsDistributionResponse {
    return GetUserGroupsDistributionResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetUserGroupsDistributionResponse>): GetUserGroupsDistributionResponse {
    const message = createBaseGetUserGroupsDistributionResponse();
    message.userIsDebtor = object.userIsDebtor?.map((e) => Group.fromPartial(e)) || [];
    message.userIsPayer = object.userIsPayer?.map((e) => Group.fromPartial(e)) || [];
    message.nonGroupBalance = object.nonGroupBalance ?? 0;
    return message;
  },
};

function createBaseDiff(): Diff {
  return { userId: "", diff: 0 };
}

export const Diff = {
  encode(message: Diff, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.userId !== "") {
      writer.uint32(10).string(message.userId);
    }
    if (message.diff !== 0) {
      writer.uint32(16).int64(message.diff);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Diff {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDiff();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.userId = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.diff = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Diff>): Diff {
    return Diff.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Diff>): Diff {
    const message = createBaseDiff();
    message.userId = object.userId ?? "";
    message.diff = object.diff ?? 0;
    return message;
  },
};

function createBaseSearchGroupMemberRequest(): SearchGroupMemberRequest {
  return { groupId: "", prefix: "" };
}

export const SearchGroupMemberRequest = {
  encode(message: SearchGroupMemberRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    if (message.prefix !== "") {
      writer.uint32(18).string(message.prefix);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchGroupMemberRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchGroupMemberRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.prefix = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SearchGroupMemberRequest>): SearchGroupMemberRequest {
    return SearchGroupMemberRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchGroupMemberRequest>): SearchGroupMemberRequest {
    const message = createBaseSearchGroupMemberRequest();
    message.groupId = object.groupId ?? "";
    message.prefix = object.prefix ?? "";
    return message;
  },
};

function createBaseSearchGroupMemberResponse(): SearchGroupMemberResponse {
  return { users: [] };
}

export const SearchGroupMemberResponse = {
  encode(message: SearchGroupMemberResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.users) {
      User.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SearchGroupMemberResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSearchGroupMemberResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.users.push(User.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<SearchGroupMemberResponse>): SearchGroupMemberResponse {
    return SearchGroupMemberResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<SearchGroupMemberResponse>): SearchGroupMemberResponse {
    const message = createBaseSearchGroupMemberResponse();
    message.users = object.users?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCreateGroupExpenseRequest(): CreateGroupExpenseRequest {
  return { groupId: "", expenseName: "", payers: [], debtors: [] };
}

export const CreateGroupExpenseRequest = {
  encode(message: CreateGroupExpenseRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    if (message.expenseName !== "") {
      writer.uint32(18).string(message.expenseName);
    }
    for (const v of message.payers) {
      Diff.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.debtors) {
      Diff.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateGroupExpenseRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateGroupExpenseRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.expenseName = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.payers.push(Diff.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.debtors.push(Diff.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CreateGroupExpenseRequest>): CreateGroupExpenseRequest {
    return CreateGroupExpenseRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CreateGroupExpenseRequest>): CreateGroupExpenseRequest {
    const message = createBaseCreateGroupExpenseRequest();
    message.groupId = object.groupId ?? "";
    message.expenseName = object.expenseName ?? "";
    message.payers = object.payers?.map((e) => Diff.fromPartial(e)) || [];
    message.debtors = object.debtors?.map((e) => Diff.fromPartial(e)) || [];
    return message;
  },
};

function createBaseDeleteGroupExpenseRequest(): DeleteGroupExpenseRequest {
  return { expenseId: "", groupId: "" };
}

export const DeleteGroupExpenseRequest = {
  encode(message: DeleteGroupExpenseRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.expenseId !== "") {
      writer.uint32(10).string(message.expenseId);
    }
    if (message.groupId !== "") {
      writer.uint32(18).string(message.groupId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteGroupExpenseRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteGroupExpenseRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.expenseId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.groupId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<DeleteGroupExpenseRequest>): DeleteGroupExpenseRequest {
    return DeleteGroupExpenseRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DeleteGroupExpenseRequest>): DeleteGroupExpenseRequest {
    const message = createBaseDeleteGroupExpenseRequest();
    message.expenseId = object.expenseId ?? "";
    message.groupId = object.groupId ?? "";
    return message;
  },
};

function createBaseListGroupExpensesRequest(): ListGroupExpensesRequest {
  return { n: 0, offset: 0, groupId: "" };
}

export const ListGroupExpensesRequest = {
  encode(message: ListGroupExpensesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.n !== 0) {
      writer.uint32(8).int64(message.n);
    }
    if (message.offset !== 0) {
      writer.uint32(16).int64(message.offset);
    }
    if (message.groupId !== "") {
      writer.uint32(26).string(message.groupId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListGroupExpensesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListGroupExpensesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.n = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.offset = longToNumber(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.groupId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ListGroupExpensesRequest>): ListGroupExpensesRequest {
    return ListGroupExpensesRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListGroupExpensesRequest>): ListGroupExpensesRequest {
    const message = createBaseListGroupExpensesRequest();
    message.n = object.n ?? 0;
    message.offset = object.offset ?? 0;
    message.groupId = object.groupId ?? "";
    return message;
  },
};

function createBaseListGroupExpensesResponse(): ListGroupExpensesResponse {
  return { expenses: [] };
}

export const ListGroupExpensesResponse = {
  encode(message: ListGroupExpensesResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.expenses) {
      Expense.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListGroupExpensesResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListGroupExpensesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.expenses.push(Expense.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ListGroupExpensesResponse>): ListGroupExpensesResponse {
    return ListGroupExpensesResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListGroupExpensesResponse>): ListGroupExpensesResponse {
    const message = createBaseListGroupExpensesResponse();
    message.expenses = object.expenses?.map((e) => Expense.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGetGroupBalancesRequest(): GetGroupBalancesRequest {
  return { groupId: "" };
}

export const GetGroupBalancesRequest = {
  encode(message: GetGroupBalancesRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGroupBalancesRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGroupBalancesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGroupBalancesRequest>): GetGroupBalancesRequest {
    return GetGroupBalancesRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGroupBalancesRequest>): GetGroupBalancesRequest {
    const message = createBaseGetGroupBalancesRequest();
    message.groupId = object.groupId ?? "";
    return message;
  },
};

function createBaseGetGroupBalancesResponse(): GetGroupBalancesResponse {
  return { users: [] };
}

export const GetGroupBalancesResponse = {
  encode(message: GetGroupBalancesResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.users) {
      User.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGroupBalancesResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGroupBalancesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.users.push(User.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGroupBalancesResponse>): GetGroupBalancesResponse {
    return GetGroupBalancesResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGroupBalancesResponse>): GetGroupBalancesResponse {
    const message = createBaseGetGroupBalancesResponse();
    message.users = object.users?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAddUsersToGroupRequest(): AddUsersToGroupRequest {
  return { groupId: "", usersIds: [] };
}

export const AddUsersToGroupRequest = {
  encode(message: AddUsersToGroupRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    for (const v of message.usersIds) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AddUsersToGroupRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAddUsersToGroupRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.usersIds.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<AddUsersToGroupRequest>): AddUsersToGroupRequest {
    return AddUsersToGroupRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<AddUsersToGroupRequest>): AddUsersToGroupRequest {
    const message = createBaseAddUsersToGroupRequest();
    message.groupId = object.groupId ?? "";
    message.usersIds = object.usersIds?.map((e) => e) || [];
    return message;
  },
};

function createBaseGetGroupUsersRequest(): GetGroupUsersRequest {
  return { groupId: "" };
}

export const GetGroupUsersRequest = {
  encode(message: GetGroupUsersRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGroupUsersRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGroupUsersRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGroupUsersRequest>): GetGroupUsersRequest {
    return GetGroupUsersRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGroupUsersRequest>): GetGroupUsersRequest {
    const message = createBaseGetGroupUsersRequest();
    message.groupId = object.groupId ?? "";
    return message;
  },
};

function createBaseGetGroupUsersResponse(): GetGroupUsersResponse {
  return { users: [] };
}

export const GetGroupUsersResponse = {
  encode(message: GetGroupUsersResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.users) {
      User.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGroupUsersResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGroupUsersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.users.push(User.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGroupUsersResponse>): GetGroupUsersResponse {
    return GetGroupUsersResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGroupUsersResponse>): GetGroupUsersResponse {
    const message = createBaseGetGroupUsersResponse();
    message.users = object.users?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCreateGroupRequest(): CreateGroupRequest {
  return { name: "", imagePath: "", type: 0, usersIds: [] };
}

export const CreateGroupRequest = {
  encode(message: CreateGroupRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.imagePath !== "") {
      writer.uint32(18).string(message.imagePath);
    }
    if (message.type !== 0) {
      writer.uint32(24).int64(message.type);
    }
    for (const v of message.usersIds) {
      writer.uint32(34).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateGroupRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateGroupRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.imagePath = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.type = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.usersIds.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CreateGroupRequest>): CreateGroupRequest {
    return CreateGroupRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CreateGroupRequest>): CreateGroupRequest {
    const message = createBaseCreateGroupRequest();
    message.name = object.name ?? "";
    message.imagePath = object.imagePath ?? "";
    message.type = object.type ?? 0;
    message.usersIds = object.usersIds?.map((e) => e) || [];
    return message;
  },
};

function createBaseCreateGroupResponse(): CreateGroupResponse {
  return { groupId: "" };
}

export const CreateGroupResponse = {
  encode(message: CreateGroupResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateGroupResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateGroupResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CreateGroupResponse>): CreateGroupResponse {
    return CreateGroupResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CreateGroupResponse>): CreateGroupResponse {
    const message = createBaseCreateGroupResponse();
    message.groupId = object.groupId ?? "";
    return message;
  },
};

function createBaseDeleteGroupRequest(): DeleteGroupRequest {
  return { groupId: "" };
}

export const DeleteGroupRequest = {
  encode(message: DeleteGroupRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeleteGroupRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeleteGroupRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<DeleteGroupRequest>): DeleteGroupRequest {
    return DeleteGroupRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<DeleteGroupRequest>): DeleteGroupRequest {
    const message = createBaseDeleteGroupRequest();
    message.groupId = object.groupId ?? "";
    return message;
  },
};

function createBaseGetGroupRequest(): GetGroupRequest {
  return { groupId: "" };
}

export const GetGroupRequest = {
  encode(message: GetGroupRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGroupRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGroupRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGroupRequest>): GetGroupRequest {
    return GetGroupRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGroupRequest>): GetGroupRequest {
    const message = createBaseGetGroupRequest();
    message.groupId = object.groupId ?? "";
    return message;
  },
};

function createBaseGetGroupResponse(): GetGroupResponse {
  return { group: undefined };
}

export const GetGroupResponse = {
  encode(message: GetGroupResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.group !== undefined) {
      Group.encode(message.group, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetGroupResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetGroupResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.group = Group.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetGroupResponse>): GetGroupResponse {
    return GetGroupResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetGroupResponse>): GetGroupResponse {
    const message = createBaseGetGroupResponse();
    message.group = (object.group !== undefined && object.group !== null) ? Group.fromPartial(object.group) : undefined;
    return message;
  },
};

function createBaseChangeGroupTypeRequest(): ChangeGroupTypeRequest {
  return { groupId: "", newType: 0 };
}

export const ChangeGroupTypeRequest = {
  encode(message: ChangeGroupTypeRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    if (message.newType !== 0) {
      writer.uint32(16).int64(message.newType);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ChangeGroupTypeRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseChangeGroupTypeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.newType = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ChangeGroupTypeRequest>): ChangeGroupTypeRequest {
    return ChangeGroupTypeRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ChangeGroupTypeRequest>): ChangeGroupTypeRequest {
    const message = createBaseChangeGroupTypeRequest();
    message.groupId = object.groupId ?? "";
    message.newType = object.newType ?? 0;
    return message;
  },
};

function createBaseDebt(): Debt {
  return { payerId: "", debtorId: "", amount: 0 };
}

export const Debt = {
  encode(message: Debt, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.payerId !== "") {
      writer.uint32(10).string(message.payerId);
    }
    if (message.debtorId !== "") {
      writer.uint32(18).string(message.debtorId);
    }
    if (message.amount !== 0) {
      writer.uint32(24).int64(message.amount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Debt {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDebt();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.payerId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.debtorId = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.amount = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<Debt>): Debt {
    return Debt.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<Debt>): Debt {
    const message = createBaseDebt();
    message.payerId = object.payerId ?? "";
    message.debtorId = object.debtorId ?? "";
    message.amount = object.amount ?? 0;
    return message;
  },
};

function createBaseGroupSettleUpRequest(): GroupSettleUpRequest {
  return { groupId: "", debt: undefined };
}

export const GroupSettleUpRequest = {
  encode(message: GroupSettleUpRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    if (message.debt !== undefined) {
      Debt.encode(message.debt, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GroupSettleUpRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroupSettleUpRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.debt = Debt.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GroupSettleUpRequest>): GroupSettleUpRequest {
    return GroupSettleUpRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GroupSettleUpRequest>): GroupSettleUpRequest {
    const message = createBaseGroupSettleUpRequest();
    message.groupId = object.groupId ?? "";
    message.debt = (object.debt !== undefined && object.debt !== null) ? Debt.fromPartial(object.debt) : undefined;
    return message;
  },
};

function createBaseGetUserPayersDebtorsInGroupRequest(): GetUserPayersDebtorsInGroupRequest {
  return { groupId: "", userId: "" };
}

export const GetUserPayersDebtorsInGroupRequest = {
  encode(message: GetUserPayersDebtorsInGroupRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    if (message.userId !== "") {
      writer.uint32(18).string(message.userId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetUserPayersDebtorsInGroupRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUserPayersDebtorsInGroupRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.userId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetUserPayersDebtorsInGroupRequest>): GetUserPayersDebtorsInGroupRequest {
    return GetUserPayersDebtorsInGroupRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetUserPayersDebtorsInGroupRequest>): GetUserPayersDebtorsInGroupRequest {
    const message = createBaseGetUserPayersDebtorsInGroupRequest();
    message.groupId = object.groupId ?? "";
    message.userId = object.userId ?? "";
    return message;
  },
};

function createBaseGetUserPayersDebtorsInGroupResponse(): GetUserPayersDebtorsInGroupResponse {
  return { debtors: [], payers: [] };
}

export const GetUserPayersDebtorsInGroupResponse = {
  encode(message: GetUserPayersDebtorsInGroupResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.debtors) {
      User.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.payers) {
      User.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetUserPayersDebtorsInGroupResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetUserPayersDebtorsInGroupResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.debtors.push(User.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.payers.push(User.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetUserPayersDebtorsInGroupResponse>): GetUserPayersDebtorsInGroupResponse {
    return GetUserPayersDebtorsInGroupResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<GetUserPayersDebtorsInGroupResponse>): GetUserPayersDebtorsInGroupResponse {
    const message = createBaseGetUserPayersDebtorsInGroupResponse();
    message.debtors = object.debtors?.map((e) => User.fromPartial(e)) || [];
    message.payers = object.payers?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

function createBaseCheckUserInGroupRequest(): CheckUserInGroupRequest {
  return { groupId: "", userId: "" };
}

export const CheckUserInGroupRequest = {
  encode(message: CheckUserInGroupRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    if (message.userId !== "") {
      writer.uint32(18).string(message.userId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CheckUserInGroupRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCheckUserInGroupRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.userId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CheckUserInGroupRequest>): CheckUserInGroupRequest {
    return CheckUserInGroupRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CheckUserInGroupRequest>): CheckUserInGroupRequest {
    const message = createBaseCheckUserInGroupRequest();
    message.groupId = object.groupId ?? "";
    message.userId = object.userId ?? "";
    return message;
  },
};

function createBaseCheckUserInGroupResponse(): CheckUserInGroupResponse {
  return { result: false };
}

export const CheckUserInGroupResponse = {
  encode(message: CheckUserInGroupResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.result === true) {
      writer.uint32(8).bool(message.result);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CheckUserInGroupResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCheckUserInGroupResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.result = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<CheckUserInGroupResponse>): CheckUserInGroupResponse {
    return CheckUserInGroupResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<CheckUserInGroupResponse>): CheckUserInGroupResponse {
    const message = createBaseCheckUserInGroupResponse();
    message.result = object.result ?? false;
    return message;
  },
};

function createBaseMyProfileResponse(): MyProfileResponse {
  return { user: undefined, groups: [], friends: [] };
}

export const MyProfileResponse = {
  encode(message: MyProfileResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.groups) {
      Group.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.friends) {
      User.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MyProfileResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMyProfileResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.user = User.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.groups.push(Group.decode(reader, reader.uint32()));
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.friends.push(User.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<MyProfileResponse>): MyProfileResponse {
    return MyProfileResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<MyProfileResponse>): MyProfileResponse {
    const message = createBaseMyProfileResponse();
    message.user = (object.user !== undefined && object.user !== null) ? User.fromPartial(object.user) : undefined;
    message.groups = object.groups?.map((e) => Group.fromPartial(e)) || [];
    message.friends = object.friends?.map((e) => User.fromPartial(e)) || [];
    return message;
  },
};

function createBaseListMyGroupsResponse(): ListMyGroupsResponse {
  return { groups: [] };
}

export const ListMyGroupsResponse = {
  encode(message: ListMyGroupsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.groups) {
      Group.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListMyGroupsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListMyGroupsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groups.push(Group.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ListMyGroupsResponse>): ListMyGroupsResponse {
    return ListMyGroupsResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ListMyGroupsResponse>): ListMyGroupsResponse {
    const message = createBaseListMyGroupsResponse();
    message.groups = object.groups?.map((e) => Group.fromPartial(e)) || [];
    return message;
  },
};

function createBaseLeaveGroupRequest(): LeaveGroupRequest {
  return { groupId: "" };
}

export const LeaveGroupRequest = {
  encode(message: LeaveGroupRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.groupId !== "") {
      writer.uint32(10).string(message.groupId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LeaveGroupRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLeaveGroupRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.groupId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<LeaveGroupRequest>): LeaveGroupRequest {
    return LeaveGroupRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<LeaveGroupRequest>): LeaveGroupRequest {
    const message = createBaseLeaveGroupRequest();
    message.groupId = object.groupId ?? "";
    return message;
  },
};

function createBaseJoinGroupRequest(): JoinGroupRequest {
  return { inviteCode: "" };
}

export const JoinGroupRequest = {
  encode(message: JoinGroupRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.inviteCode !== "") {
      writer.uint32(10).string(message.inviteCode);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): JoinGroupRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseJoinGroupRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.inviteCode = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<JoinGroupRequest>): JoinGroupRequest {
    return JoinGroupRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<JoinGroupRequest>): JoinGroupRequest {
    const message = createBaseJoinGroupRequest();
    message.inviteCode = object.inviteCode ?? "";
    return message;
  },
};

function createBaseExpenseInfoRequest(): ExpenseInfoRequest {
  return { expenseId: "" };
}

export const ExpenseInfoRequest = {
  encode(message: ExpenseInfoRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.expenseId !== "") {
      writer.uint32(10).string(message.expenseId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExpenseInfoRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExpenseInfoRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.expenseId = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ExpenseInfoRequest>): ExpenseInfoRequest {
    return ExpenseInfoRequest.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ExpenseInfoRequest>): ExpenseInfoRequest {
    const message = createBaseExpenseInfoRequest();
    message.expenseId = object.expenseId ?? "";
    return message;
  },
};

function createBaseExpenseInfoResponse(): ExpenseInfoResponse {
  return { usersDistribution: [] };
}

export const ExpenseInfoResponse = {
  encode(message: ExpenseInfoResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.usersDistribution) {
      Debt.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExpenseInfoResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExpenseInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.usersDistribution.push(Debt.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ExpenseInfoResponse>): ExpenseInfoResponse {
    return ExpenseInfoResponse.fromPartial(base ?? {});
  },
  fromPartial(object: DeepPartial<ExpenseInfoResponse>): ExpenseInfoResponse {
    const message = createBaseExpenseInfoResponse();
    message.usersDistribution = object.usersDistribution?.map((e) => Debt.fromPartial(e)) || [];
    return message;
  },
};

export type ServiceDefinition = typeof ServiceDefinition;
export const ServiceDefinition = {
  name: "Service",
  fullName: "api.Service",
  methods: {
    register: {
      name: "Register",
      requestType: RegisterRequest,
      requestStream: false,
      responseType: Token,
      responseStream: false,
      options: {},
    },
    login: {
      name: "Login",
      requestType: LoginRequest,
      requestStream: false,
      responseType: Token,
      responseStream: false,
      options: {},
    },
    renewToken: {
      name: "RenewToken",
      requestType: Empty,
      requestStream: false,
      responseType: Token,
      responseStream: false,
      options: {},
    },
    addFriend: {
      name: "AddFriend",
      requestType: AddFriendRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    listMyFriends: {
      name: "ListMyFriends",
      requestType: Empty,
      requestStream: false,
      responseType: ListMyFriendsResponse,
      responseStream: false,
      options: {},
    },
    createFriendExpense: {
      name: "CreateFriendExpense",
      requestType: CreateFriendExpenseRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    deleteFriendExpense: {
      name: "DeleteFriendExpense",
      requestType: DeleteFriendExpenseRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    listFriendsExpenses: {
      name: "ListFriendsExpenses",
      requestType: ListFriendsExpensesRequest,
      requestStream: false,
      responseType: ListFriendsExpensesResponse,
      responseStream: false,
      options: {},
    },
    friendSettleUp: {
      name: "FriendSettleUp",
      requestType: FriendSettleUpRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    searchUser: {
      name: "SearchUser",
      requestType: SearchUserRequest,
      requestStream: false,
      responseType: SearchUserResponse,
      responseStream: false,
      options: {},
    },
    getUsersWithOutstandingBalance: {
      name: "GetUsersWithOutstandingBalance",
      requestType: Empty,
      requestStream: false,
      responseType: GetUsersWithOutstandingBalanceResponse,
      responseStream: false,
      options: {},
    },
    getUserGroupsDistribution: {
      name: "GetUserGroupsDistribution",
      requestType: GetUserGroupsDistributionRequest,
      requestStream: false,
      responseType: GetUserGroupsDistributionResponse,
      responseStream: false,
      options: {},
    },
    searchGroup: {
      name: "SearchGroup",
      requestType: SearchGroupRequest,
      requestStream: false,
      responseType: SearchGroupResponse,
      responseStream: false,
      options: {},
    },
    createGroupExpense: {
      name: "CreateGroupExpense",
      requestType: CreateGroupExpenseRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    deleteGroupExpense: {
      name: "DeleteGroupExpense",
      requestType: DeleteGroupExpenseRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    listGroupExpenses: {
      name: "ListGroupExpenses",
      requestType: ListGroupExpensesRequest,
      requestStream: false,
      responseType: ListGroupExpensesResponse,
      responseStream: false,
      options: {},
    },
    createGroup: {
      name: "CreateGroup",
      requestType: CreateGroupRequest,
      requestStream: false,
      responseType: CreateGroupResponse,
      responseStream: false,
      options: {},
    },
    deleteGroup: {
      name: "DeleteGroup",
      requestType: DeleteGroupRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    getGroup: {
      name: "GetGroup",
      requestType: GetGroupRequest,
      requestStream: false,
      responseType: GetGroupResponse,
      responseStream: false,
      options: {},
    },
    changeGroupType: {
      name: "ChangeGroupType",
      requestType: ChangeGroupTypeRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    getGroupBalances: {
      name: "GetGroupBalances",
      requestType: GetGroupBalancesRequest,
      requestStream: false,
      responseType: GetGroupBalancesResponse,
      responseStream: false,
      options: {},
    },
    addUsersToGroup: {
      name: "AddUsersToGroup",
      requestType: AddUsersToGroupRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    getGroupUsers: {
      name: "GetGroupUsers",
      requestType: GetGroupUsersRequest,
      requestStream: false,
      responseType: GetGroupUsersResponse,
      responseStream: false,
      options: {},
    },
    groupSettleUp: {
      name: "GroupSettleUp",
      requestType: GroupSettleUpRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    getUserPayersDebtorsInGroup: {
      name: "GetUserPayersDebtorsInGroup",
      requestType: GetUserPayersDebtorsInGroupRequest,
      requestStream: false,
      responseType: GetUserPayersDebtorsInGroupResponse,
      responseStream: false,
      options: {},
    },
    getGroupDebts: {
      name: "GetGroupDebts",
      requestType: GetGroupDebtsRequest,
      requestStream: false,
      responseType: GetGroupDebtsResponse,
      responseStream: false,
      options: {},
    },
    checkUserInGroup: {
      name: "CheckUserInGroup",
      requestType: CheckUserInGroupRequest,
      requestStream: false,
      responseType: CheckUserInGroupResponse,
      responseStream: false,
      options: {},
    },
    myProfile: {
      name: "MyProfile",
      requestType: Empty,
      requestStream: false,
      responseType: MyProfileResponse,
      responseStream: false,
      options: {},
    },
    listMyGroups: {
      name: "ListMyGroups",
      requestType: Empty,
      requestStream: false,
      responseType: ListMyGroupsResponse,
      responseStream: false,
      options: {},
    },
    leaveGroup: {
      name: "LeaveGroup",
      requestType: LeaveGroupRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    joinGroup: {
      name: "JoinGroup",
      requestType: JoinGroupRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    expenseInfo: {
      name: "ExpenseInfo",
      requestType: ExpenseInfoRequest,
      requestStream: false,
      responseType: ExpenseInfoResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface ServiceImplementation<CallContextExt = {}> {
  register(request: RegisterRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Token>>;
  login(request: LoginRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Token>>;
  renewToken(request: Empty, context: CallContext & CallContextExt): Promise<DeepPartial<Token>>;
  addFriend(request: AddFriendRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  listMyFriends(request: Empty, context: CallContext & CallContextExt): Promise<DeepPartial<ListMyFriendsResponse>>;
  createFriendExpense(
    request: CreateFriendExpenseRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<Empty>>;
  deleteFriendExpense(
    request: DeleteFriendExpenseRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<Empty>>;
  listFriendsExpenses(
    request: ListFriendsExpensesRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<ListFriendsExpensesResponse>>;
  friendSettleUp(request: FriendSettleUpRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  searchUser(
    request: SearchUserRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<SearchUserResponse>>;
  getUsersWithOutstandingBalance(
    request: Empty,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetUsersWithOutstandingBalanceResponse>>;
  getUserGroupsDistribution(
    request: GetUserGroupsDistributionRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetUserGroupsDistributionResponse>>;
  searchGroup(
    request: SearchGroupRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<SearchGroupResponse>>;
  createGroupExpense(
    request: CreateGroupExpenseRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<Empty>>;
  deleteGroupExpense(
    request: DeleteGroupExpenseRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<Empty>>;
  listGroupExpenses(
    request: ListGroupExpensesRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<ListGroupExpensesResponse>>;
  createGroup(
    request: CreateGroupRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<CreateGroupResponse>>;
  deleteGroup(request: DeleteGroupRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  getGroup(request: GetGroupRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetGroupResponse>>;
  changeGroupType(request: ChangeGroupTypeRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  getGroupBalances(
    request: GetGroupBalancesRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetGroupBalancesResponse>>;
  addUsersToGroup(request: AddUsersToGroupRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  getGroupUsers(
    request: GetGroupUsersRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetGroupUsersResponse>>;
  groupSettleUp(request: GroupSettleUpRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  getUserPayersDebtorsInGroup(
    request: GetUserPayersDebtorsInGroupRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetUserPayersDebtorsInGroupResponse>>;
  getGroupDebts(
    request: GetGroupDebtsRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<GetGroupDebtsResponse>>;
  checkUserInGroup(
    request: CheckUserInGroupRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<CheckUserInGroupResponse>>;
  myProfile(request: Empty, context: CallContext & CallContextExt): Promise<DeepPartial<MyProfileResponse>>;
  listMyGroups(request: Empty, context: CallContext & CallContextExt): Promise<DeepPartial<ListMyGroupsResponse>>;
  leaveGroup(request: LeaveGroupRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  joinGroup(request: JoinGroupRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Empty>>;
  expenseInfo(
    request: ExpenseInfoRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<ExpenseInfoResponse>>;
}

export interface ServiceClient<CallOptionsExt = {}> {
  register(request: DeepPartial<RegisterRequest>, options?: CallOptions & CallOptionsExt): Promise<Token>;
  login(request: DeepPartial<LoginRequest>, options?: CallOptions & CallOptionsExt): Promise<Token>;
  renewToken(request: DeepPartial<Empty>, options?: CallOptions & CallOptionsExt): Promise<Token>;
  addFriend(request: DeepPartial<AddFriendRequest>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  listMyFriends(request: DeepPartial<Empty>, options?: CallOptions & CallOptionsExt): Promise<ListMyFriendsResponse>;
  createFriendExpense(
    request: DeepPartial<CreateFriendExpenseRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<Empty>;
  deleteFriendExpense(
    request: DeepPartial<DeleteFriendExpenseRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<Empty>;
  listFriendsExpenses(
    request: DeepPartial<ListFriendsExpensesRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<ListFriendsExpensesResponse>;
  friendSettleUp(request: DeepPartial<FriendSettleUpRequest>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  searchUser(
    request: DeepPartial<SearchUserRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<SearchUserResponse>;
  getUsersWithOutstandingBalance(
    request: DeepPartial<Empty>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetUsersWithOutstandingBalanceResponse>;
  getUserGroupsDistribution(
    request: DeepPartial<GetUserGroupsDistributionRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetUserGroupsDistributionResponse>;
  searchGroup(
    request: DeepPartial<SearchGroupRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<SearchGroupResponse>;
  createGroupExpense(
    request: DeepPartial<CreateGroupExpenseRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<Empty>;
  deleteGroupExpense(
    request: DeepPartial<DeleteGroupExpenseRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<Empty>;
  listGroupExpenses(
    request: DeepPartial<ListGroupExpensesRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<ListGroupExpensesResponse>;
  createGroup(
    request: DeepPartial<CreateGroupRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<CreateGroupResponse>;
  deleteGroup(request: DeepPartial<DeleteGroupRequest>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  getGroup(request: DeepPartial<GetGroupRequest>, options?: CallOptions & CallOptionsExt): Promise<GetGroupResponse>;
  changeGroupType(request: DeepPartial<ChangeGroupTypeRequest>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  getGroupBalances(
    request: DeepPartial<GetGroupBalancesRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetGroupBalancesResponse>;
  addUsersToGroup(request: DeepPartial<AddUsersToGroupRequest>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  getGroupUsers(
    request: DeepPartial<GetGroupUsersRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetGroupUsersResponse>;
  groupSettleUp(request: DeepPartial<GroupSettleUpRequest>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  getUserPayersDebtorsInGroup(
    request: DeepPartial<GetUserPayersDebtorsInGroupRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetUserPayersDebtorsInGroupResponse>;
  getGroupDebts(
    request: DeepPartial<GetGroupDebtsRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<GetGroupDebtsResponse>;
  checkUserInGroup(
    request: DeepPartial<CheckUserInGroupRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<CheckUserInGroupResponse>;
  myProfile(request: DeepPartial<Empty>, options?: CallOptions & CallOptionsExt): Promise<MyProfileResponse>;
  listMyGroups(request: DeepPartial<Empty>, options?: CallOptions & CallOptionsExt): Promise<ListMyGroupsResponse>;
  leaveGroup(request: DeepPartial<LeaveGroupRequest>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  joinGroup(request: DeepPartial<JoinGroupRequest>, options?: CallOptions & CallOptionsExt): Promise<Empty>;
  expenseInfo(
    request: DeepPartial<ExpenseInfoRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<ExpenseInfoResponse>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function toTimestamp(date: Date): Timestamp {
  const seconds = Math.trunc(date.getTime() / 1_000);
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = (t.seconds || 0) * 1_000;
  millis += (t.nanos || 0) / 1_000_000;
  return new globalThis.Date(millis);
}

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
