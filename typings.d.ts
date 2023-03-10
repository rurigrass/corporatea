import { type } from "os"

export interface IPost {
  _id: string
  title: string
  company: { name: string }
  author: { name: string, image: string }
  slug: { _type: string, current: string }
  mainImage: { asset: { url: string } }
  body: [object]
  verified: boolean
  _createdAt: string
  comments: IComment[]
}

export interface IComment {
  approved: boolean,
  comment: string,
  post: {
    _ref: string,
    _type: string
  },
  _createdAt: string,
  _id: string,
  _rev: string,
  _type: string,
  _updatedAt: string
}

export interface ISpill extends ISpillBody {
  _id: string
  _createdAt: string
  _updatedAt: string
  _rev: string
  _type: 'spill'
  slug: { _type: string, current: string }
  verified: boolean
  blockSpill: boolean
  // comments: IComment[]
}

export type ISpillBody = {
  spill: string
  author: string
  company: { name: string, image: { asset: { url: string } } | null }
}

export interface ISpillComment extends ISpillCommentBody {
  _id: string,
  spill: {
    _ref: string,
    _type: string
  },
  blockComment: boolean,
  _createdAt: string,
  _rev: string,
  _type: string,
  _updatedAt: string,
  approved: boolean
}

type ISpillCommentBody = {
  comment: string,
  _createdAt: string
}

export interface ICompany {
  _id: string
  image: { asset: { url: string } } | null
  name: string
  slug: { _type: string, current: string } | null
}

//ARRAY TYPINGS 

interface IPosts {
  posts: IPost[]
};

interface ICompanies {
  companies: ICompany[]
}

interface ISpills {
  spills: ISpill[]
}