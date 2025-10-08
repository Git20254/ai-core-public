import { Injectable } from '@nestjs/common';

export type Track = {
  id: string;
  title: string;
  artist: string;
  artwork: string;
};

@Injectable()
export class TracksService {
  findAll(): Track[] {
    return [
      {
        id: "1",
        title: "Me Against the World",
        artist: "Tupac",
        artwork: "https://res.cloudinary.com/dfh9pdml1/image/upload/c_fill,h_500,w_500/v1759442711/qoy8vyqb3ahu5j3lpjux.png"
      },
      {
        id: "2",
        title: "Lose Yourself",
        artist: "Eminem",
        artwork: "https://res.cloudinary.com/dfh9pdml1/image/upload/c_fill,h_500,w_500/v1759433175/qrsz3dbazt0sce1pqbcv.png"
      }
    ];
  }
}

