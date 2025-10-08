import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  // 🟢 Public endpoint – list discoverable playlists
  @Get('public')
  async getPublicPlaylists() {
    return this.playlistsService.getAllPublicPlaylists();
  }

  // 🟣 Get user's own playlists
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyPlaylists(@Req() req: any) {
    return this.playlistsService.getUserPlaylists(req.user.userId);
  }

  // 🟡 Create a new playlist
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createPlaylist(
    @Req() req: any,
    @Body('name') name: string,
    @Body('description') description?: string,
    @Body('isPublic') isPublic?: boolean,
  ) {
    return this.playlistsService.createPlaylist(
      req.user.userId,
      name,
      description,
      isPublic,
    );
  }

  // 🔵 Add a track to playlist
  @UseGuards(JwtAuthGuard)
  @Post(':playlistId/tracks/:trackId')
  async addTrack(
    @Param('playlistId') playlistId: number,
    @Param('trackId') trackId: number,
    @Req() req: any,
  ) {
    return this.playlistsService.addTrackToPlaylist(
      +playlistId,
      +trackId,
      req.user.userId,
    );
  }

  // 🔴 Remove a track
  @UseGuards(JwtAuthGuard)
  @Delete(':playlistId/tracks/:trackId')
  async removeTrack(
    @Param('playlistId') playlistId: number,
    @Param('trackId') trackId: number,
    @Req() req: any,
  ) {
    return this.playlistsService.removeTrackFromPlaylist(
      +playlistId,
      +trackId,
      req.user.userId,
    );
  }

  // 🧡 Follow/unfollow a playlist
  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async toggleFollow(@Param('id') id: number, @Req() req: any) {
    return this.playlistsService.toggleFollow(+id, req.user.userId);
  }

  // 🧩 Get playlist details (public, owned, or collaborator)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPlaylistDetails(@Param('id') id: number) {
    return this.playlistsService.getPlaylistDetails(+id);
  }

  // 🗑️ Delete playlist
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePlaylist(@Param('id') id: number, @Req() req: any) {
    return this.playlistsService.deletePlaylist(+id, req.user.userId);
  }

  // 🤝 Invite a collaborator (owner or inviter)
  @UseGuards(JwtAuthGuard)
  @Post(':playlistId/collaborators/invite')
  async inviteCollaborator(
    @Param('playlistId') playlistId: number,
    @Body('email') email: string,
    @Body('canEdit') canEdit: boolean,
    @Body('canInvite') canInvite: boolean,
    @Req() req: any,
  ) {
    return this.playlistsService.inviteCollaborator(
      +playlistId,
      req.user.userId,
      email,
      canEdit,
      canInvite,
    );
  }

  // 👀 View all collaborators on a playlist
  @UseGuards(JwtAuthGuard)
  @Get(':playlistId/collaborators')
  async getCollaborators(
    @Param('playlistId') playlistId: number,
    @Req() req: any,
  ) {
    return this.playlistsService.getCollaborators(+playlistId, req.user.userId);
  }

  // ✏️ Update collaborator permissions (owner only)
  @UseGuards(JwtAuthGuard)
  @Patch(':playlistId/collaborators/:collaboratorId')
  async updateCollaboratorPermissions(
    @Param('playlistId') playlistId: number,
    @Param('collaboratorId') collaboratorId: number,
    @Body('canEdit') canEdit: boolean,
    @Body('canInvite') canInvite: boolean,
    @Req() req: any,
  ) {
    return this.playlistsService.updateCollaboratorPermissions(
      +playlistId,
      +collaboratorId,
      req.user.userId,
      canEdit,
      canInvite,
    );
  }

  // ❌ Remove collaborator
  @UseGuards(JwtAuthGuard)
  @Delete(':playlistId/collaborators/:collaboratorId')
  async removeCollaborator(
    @Param('playlistId') playlistId: number,
    @Param('collaboratorId') collaboratorId: number,
    @Req() req: any,
  ) {
    return this.playlistsService.removeCollaborator(
      +playlistId,
      +collaboratorId,
      req.user.userId,
    );
  }
}

