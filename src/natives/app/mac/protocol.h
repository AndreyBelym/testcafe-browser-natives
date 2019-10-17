#import <Cocoa/Cocoa.h>

@protocol ExecProtocol
    - (void) execBinary:(NSString *)binary
        pipe: (NSString *)pipePath
        reply:(void (^)(void))reply;
@end