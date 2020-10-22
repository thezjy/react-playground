export const longText = `
  What are QUIC and HTTP/3?
Broadly speaking, QUIC is a replacement for the Transmission Control Protocol (TCP), one of the main protocols for internet communication. QUIC was originally developed internally by Google as Google QUIC, or gQUIC, and was presented to the IETF in 2015. Since then, it has been redesigned and improved by the broader IETF community, forming a new protocol we now call QUIC. HTTP/3 is the next iteration of HTTP, the standard protocol for web-based applications and servers. Together, QUIC and HTTP/3 represent the latest and greatest in internet-focused protocols, incorporating decades of best practices and lessons that we, Google, and the IETF community learned through running protocols on the internet.

QUIC and HTTP/3 generally outperform TCP and HTTP/2, which in turn outperform TCP and HTTP/1.1. TCP and HTTP/2 first introduced the concept of allowing a single network connection to support multiple data streams in a process called stream multiplexing. QUIC and HTTP/3 take this one step further by allowing streams to be truly independent by avoiding TCP’s dreaded head of line blocking, where lost packets jam and slow down all streams on a connection.

QUIC employs state-of-the-art loss recovery, which allows it to perform better than most TCP implementations under poor network conditions. TCP is also prone to ossification, where the protocol becomes difficult to upgrade because network middleboxes such as firewalls make assumptions about the packets’ format. QUIC avoids this issue by being fully encrypted, making protocol extensibility a first-class citizen and guaranteeing that future improvements can be made. QUIC also allows new ways to instrument, observe, and visualize transport behavior through QLOG, a JSON-based tracing format designed specifically for QUIC.

Experience-focused protocol development
We developed our own implementation of QUIC, called mvfst, in order to rapidly test and deploy QUIC on our own systems. We have a history of writing and deploying our own protocol implementations, first with our HTTP client/server library, Proxygen, and following that with the Zero protocol and then Fizz, our TLS 1.3 implementation. Facebook apps utilize both Fizz and Proxygen to communicate with our servers via Proxygen Mobile. We’ve also developed two security solutions for TLS, an extension called delegated credentials for securing certificates and DNS over TLS, for encrypting and authenticating web traffic over TLS.

Developing and deploying a new transport protocol from scratch
We wanted our new protocol to seamlessly integrate with our existing software and allow our developers to work quickly. As a proving ground, we decided to deploy QUIC on a large subset of Facebook network traffic, specifically internal network traffic that included proxied public traffic to Facebook. If QUIC didn’t work well for internal traffic, we knew it likely wouldn’t work well on the larger internet either.

In addition to shaking out bugs and other problematic behaviors, this strategy let us design a method that makes our network load balancer deeply QUIC-aware and maintains our load balancer’s zero-downtime release guarantees.

With this solid foundation in place, we moved toward deploying QUIC to people on the internet. Because of mvfst’s design, we were able to smoothly integrate QUIC support into Proxygen Mobile.

The Facebook app
The Facebook app was our first target for using QUIC on the internet. Facebook has a mature infrastructure that allows us to safely roll out changes to apps in a limited fashion before we release them to billions of people. We began with an experiment in which we enabled QUIC for dynamic GraphQL requests in the Facebook app. These are requests that do not have static content such as images and videos in the response.

Our tests have shown that QUIC offers improvements on several metrics. People on Facebook experienced a 6 percent reduction in request errors, a 20 percent tail latency reduction, and a 5 percent reduction in response header size relative to HTTP/2. This had cascading effects on other metrics as well, indicating that peoples’ experience was greatly enhanced by QUIC.

However, there were regressions. What was most puzzling was that, despite QUIC being enabled only for dynamic requests, we observed increased error rates for static content downloaded with TCP. The root cause of this would be a common theme we’d run into when transitioning traffic to QUIC: App logic was changing the type and quantity of requests for certain types of content based on the speed and reliability of requests for other types of content. So improving one type of request may have had detrimental side effects for others.

For example, a heuristic that adapted how aggressively the app requested new static content from the server was tuned in a way that created issues with QUIC. When the app makes a request to, say, load the text content of a News Feed, it waits to see how long this request takes, then determines how many image/video requests to make from there. We found the heuristic was tuned with arbitrary thresholds, which probably worked OK for TCP. But when we switched to QUIC, these thresholds were inaccurate, and the app tried to request too much at once, ultimately causing News Feed to take longer to load.

Making it scale
The next step was to deploy QUIC for static content (e.g., images and videos) in the Facebook apps. Before doing this, however, we had to address two main concerns: the CPU efficiency of mvfst and the effectiveness of our primary congestion control implementation, BBR.

Up to this point, mvfst was designed to help developers move quickly and keep up with ever-changing drafts of QUIC. Dynamic requests, whose responses are relatively small compared with those of static requests, do not require significant CPU usage, nor do they put a congestion controller through its paces.

To address these concerns, we developed performance testing tools that allowed us to assess CPU usage and how effectively our congestion controller could utilize network resources. We used these tools and synthetic load tests of QUIC in our load balancer to make several improvements. One important area, for example, was optimizing how we pace UDP packets to allow for smoother data transmission. To improve CPU usage, we employed a number of techniques, including using generic segmentation offload (GSO) to efficiently send batches of UDP packets at once. We also optimized the data structures and algorithms that handle unacknowledged QUIC data.

QUIC for all content
Before turning on QUIC for all content in the Facebook app, we partnered with several stakeholders, including our video engineers. They have a deep understanding of the important product metrics and helped us analyze the experimental results in the Facebook app as we enabled QUIC.
`
