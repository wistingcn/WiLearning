/*
	 * Copyright (c) 2020 Wisting Team. <linewei@gmail.com>
	 *
	 * This program is free software: you can use, redistribute, and/or modify
	 * it under the terms of the GNU Affero General Public License, version 3
	 * or later ("AGPL"), as published by the Free Software Foundation.
	 *
	 * This program is distributed in the hope that it will be useful, but WITHOUT
	 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
	 * FITNESS FOR A PARTICULAR PURPOSE.
	 *
	 * You should have received a copy of the GNU Affero General Public License
	 * along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
export const MediaServer = {
  address: '',
};

export const RequestConnectVideoTimeout = 60;
export const RoomLogoHeight = 50;

export const RequestTimeout = 10000;
export const DocImagesUrl = '/docs/images';

export const videoConstrain = {
  frameRate: {
    ideal: 18,
    max:  25,
    min: 12
  },
};
export const audioConstrain = {
  autoGainControl: true,
  echoCancellation: true,
  noiseSuppression: true
};
