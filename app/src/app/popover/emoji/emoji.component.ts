import { Component, OnInit } from '@angular/core';
import { emoji } from './emoji';
import { EventbusService, EventType } from '../../service/eventbus.service';

@Component({
  selector: 'app-emoji',
  templateUrl: './emoji.component.html',
  styleUrls: ['./emoji.component.scss'],
})
export class EmojiComponent implements OnInit {

  emojiArray = [];
  constructor(
    private eventbus: EventbusService,
  ) {
    for ( const kind of emoji ) {
      for ( const ele of kind.emojis ) {
        this.emojiArray.push(ele.emoji);
      }
    }
  }

  ngOnInit() {}

  // tslint:disable-next-line: no-shadowed-variable
  selectEmoji(emoji) {
    this.eventbus.chat$.next({
      type: EventType.chat_emoji,
      data: emoji
    });
  }
}
