import { Collection, ObjectId } from "mongodb";
import { mongoDB } from "../../core/database";

export class WebsitesRepository {
  private collection: Collection;

  constructor() {
    this.collection = mongoDB.db().collection("websites");
  }

  async list(url: string) {
    //
  }

  async insert(url: string, score: string) {
    //
  }
}
