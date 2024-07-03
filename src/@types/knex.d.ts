import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      name: string;
      session_id?: string;
    };
    meals: {
      name: string;
      description: string;
      isOnDiet: boolean;
      created_at: string;
      updated_at: string;
      user_id: string;
    };
  }
}
