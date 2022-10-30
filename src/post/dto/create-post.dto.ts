export class CreatePostDto {
  subredditId: string;
  title: string;
  text: string;
  nsfw: boolean;
  spoiler: boolean;
  flairs: string[];
}
