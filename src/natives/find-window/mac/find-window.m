//
//  find-window.m
//  Find AppleScript & Cocoa IDs of a window
//

#import <Cocoa/Cocoa.h>
#import "../../utils/mac/utils.h"

const SUCCESS_EXIT_CODE                 = 0;
const ERROR_EXIT_CODE                   = 1;
const NO_REQUIRED_PERMISSIONS_EXIT_CODE = 2;

const NSUInteger MAX_SEARCHING_ATTEMPTS_COUNT  = 10;
const NSUInteger SEARCHING_ATTEMPTS_DELAY      = 300000;

NSNumber * getOSAWindowId (NSNumber *processId, NSString *windowTitle) {
    @try {
        id app = getApplicationForProcess(processId);

        id windows = [app windows];
        id identifiedWindows = [windows filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"name contains %@", windowTitle]];

        if (![identifiedWindows count])
            return [NSNumber numberWithInt: 0];
                
        id targetWindow = identifiedWindows[0];

        return [targetWindow properties][@"id"];
    }
    @catch (NSException *exception) {
        return [NSNumber numberWithInt: 0];
    }
}

NSMutableDictionary * getTestCafeWindowId (NSString *windowTitle) {
    NSMutableDictionary *windowDescriptor = nil;

    NSArray *windowList  = (NSArray *) CGWindowListCopyWindowInfo(kCGWindowListOptionAll | kCGWindowListOptionAll, kCGNullWindowID);

    for (NSDictionary *dict in windowList) {
        id value = dict[(NSString *) kCGWindowName];

        if (!value)
            continue;

        NSString *windowName = value;
        NSRange  textRange   = [windowName rangeOfString: windowTitle options: NSCaseInsensitiveSearch];

        if (textRange.location != NSNotFound) {
            windowDescriptor = [NSMutableDictionary new];
            windowDescriptor[@"processId"] = dict[(NSString *)kCGWindowOwnerPID];
            windowDescriptor[@"cocoaId"] = dict[(NSString *)kCGWindowNumber];
            windowDescriptor[@"osaId"] = getOSAWindowId(windowDescriptor[@"processId"], windowTitle);
            break;
        }
    }

    return windowDescriptor;
}

BOOL haveScreenRecordingPermission () {
    CGDisplayStreamRef stream = CGDisplayStreamCreate(CGMainDisplayID(), 1, 1, kCVPixelFormatType_32BGRA, nil, ^(CGDisplayStreamFrameStatus status, uint64_t displayTime, IOSurfaceRef frameSurface, CGDisplayStreamUpdateRef updateRef) {
        ;
    });

    BOOL canRecord = stream != NULL;

    if (stream) {
        CFRelease(stream);
    }

    return canRecord;
}

int findWindow () {

    @autoreleasepool {
        if (!haveScreenRecordingPermission())
            return NO_REQUIRED_PERMISSIONS_EXIT_CODE;

        NSDictionary *windowDescriptor   = nil;
        NSUInteger seachingAttemptsCount = 0;
        BOOL searchFinished              = NO;
        
        while (seachingAttemptsCount < MAX_SEARCHING_ATTEMPTS_COUNT && !searchFinished) {
            windowDescriptor = getTestCafeWindowId(@"google");
            
            searchFinished = !!windowDescriptor && [windowDescriptor[@"osaId"] intValue] != 0;

            if (!searchFinished) {
                seachingAttemptsCount++;

                usleep(SEARCHING_ATTEMPTS_DELAY);
            }
        }

        if (!windowDescriptor) {
            fprintf(stderr, "There are no TestCafe windows\n");
            return ERROR_EXIT_CODE;
        }

        NSLog(@"%d", [windowDescriptor[@"processId"] intValue]);
        NSLog(@"%d", [windowDescriptor[@"cocoaId"] intValue]);
        NSLog(@"%d", [windowDescriptor[@"osaId"] intValue]);

        return SUCCESS_EXIT_CODE;
    }

    return SUCCESS_EXIT_CODE;
}

