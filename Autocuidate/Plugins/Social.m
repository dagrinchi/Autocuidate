//
//  Social.m
//
//  Cameron Lerch
//  Sponsored by Brightflock: http://brightflock.com
//

#import "Social.h"
#import "MyUIActivityViewController.h"
#import <Cordova/CDV.h>

@interface Social ()

@end

@implementation Social

- (void)available:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    BOOL avail = false;
    
    if (NSClassFromString(@"UIActivityViewController")) {
        avail = true;
    }
    
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:avail];
    [self writeJavascript:[pluginResult toSuccessCallbackString:[arguments objectAtIndex:0]]];
}

- (void)share:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    
    if (!NSClassFromString(@"UIActivityViewController")) {
        return;
    }
    
    NSString *text = [arguments objectAtIndex:1];
    
    NSString *imageName = [arguments objectAtIndex:2];
    UIImage *image = nil;
    
    NSData* imageData = [NSData dataFromBase64String:imageName];
    image = [[[UIImage alloc] initWithData:imageData] autorelease];
    
    NSString *urlString = [arguments objectAtIndex:3];
    NSURL *url = nil;
    
    if (urlString) {
        url = [NSURL URLWithString:urlString];
    }
    
    NSArray *activityItems = [[NSArray alloc] initWithObjects:text, image, url, nil];
    
    UIActivity *activity = [[UIActivity alloc] init];
    
    NSArray *applicationActivities = [[NSArray alloc] initWithObjects:activity, nil];
    MyUIActivityViewController *activityVC =
    [[MyUIActivityViewController alloc] initWithActivityItems:activityItems
                                      applicationActivities:applicationActivities];
    [self.viewController presentViewController:activityVC animated:YES completion:nil];
    
}

@end
