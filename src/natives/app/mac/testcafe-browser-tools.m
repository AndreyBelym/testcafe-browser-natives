#include "./protocol.h"


int main (int argc, const char * argv[]) {
    @autoreleasepool {
        NSCondition *condition = [NSCondition new];

        id SERVICE_NAME = @"com.devexpress.testcafe-browser-tools.service";

        __block BOOL completed = NO;

        NSLog(@"start");

        NSXPCInterface *interface = [NSXPCInterface interfaceWithProtocol: @protocol(ExecProtocol)];

        NSXPCConnection *connection = [[NSXPCConnection alloc] initWithServiceName: SERVICE_NAME];

        connection.invalidationHandler = ^{
            NSLog(@"Invalidated");
        };

        connection.interruptionHandler = ^{
            NSLog(@"Interrupted");
        };

        connection.remoteObjectInterface = interface;

        [connection resume];  

        [condition lock];

        id proxy = [connection remoteObjectProxyWithErrorHandler: ^ (NSError *error) { 
            NSLog(@"%@", error);
        }];

        [[connection remoteObjectProxy] execBinary: @"find-window" pipe:@"/Users/user912100" reply:^{
            NSLog(@"OK");
            
            [condition lock];

            completed = YES;

            [condition signal];
            [condition unlock];
        }]; 

        NSLog(@"wait");

        while (!completed)
            [condition wait];

        [condition unlock];
    }
    
}