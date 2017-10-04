class PagesController {
  static about(ctx, next) {
    switch (ctx.type) {
      case 'http': {
        ctx.body = 'this is about us...';

        break;
      }

      case 'websocket': {
        ctx.body = 'about ws';

        break;
      }

      default:
    }

    next();
  }
}

module.exports = PagesController;
