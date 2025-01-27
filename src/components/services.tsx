"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Mic,
  ImageIcon,
  AudioLines,
  PlayIcon,
  Image,
} from "lucide-react";
import { fontHead } from "@/ui/fonts";
import { useTranslations } from "next-intl";

type FeatureType = "text" | "voice" | "image";

interface Message {
  type: "user" | "assistant";
  content: string;
}

const featuresIcons: {
  [key in FeatureType]: React.ComponentType;
} = {
  text: MessageSquare,
  voice: Mic,
  image: ImageIcon,
};

export default function WhatsAppReminderDemo() {
  const t = useTranslations();
  const [activeFeature, setActiveFeature] = useState<FeatureType>("text");
  const [messages, setMessages] = useState<Message[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  const features = (
    Object.keys(featuresIcons) as Array<FeatureType>
  ).map((key) => ({
    id: key,
    name: t(`home_page.services.features.${key}.name`),
    description: t(`home_page.services.features.${key}.description`),
    icon: featuresIcons[key],
  }));

  useEffect(() => {
    const demoMessages = t.raw(
      `home_page.services.demoMessages.${activeFeature}`,
    ) as Message[];
    
    setMessages(demoMessages);
    setVisibleMessages([]); // Reset visible messages
    
    // Animate messages with longer delays and staggered timing
    demoMessages.forEach((_, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, index]);
      }, 1200 * (index + 1)); // Increased delay between messages
    });
  }, [activeFeature, t]);

  const renderMessage = (msg: Message, index: number) => {
    const isVisible = visibleMessages.includes(index);
    const baseMessageClass = `mb-4 ${msg.type === "user" ? "float-right text-left" : "text-left"}`;
    const animationClass = isVisible ? 'animate-fade-up animate-duration-1000 animate-ease-out' : 'opacity-0';

    const messageContentClass = `
      ${msg.type === "user" ? "bg-green-900 text-primary" : "bg-secondary"}
      ${animationClass}
      transition-all
    `;

    if (activeFeature === "text") {
      return (
        <div key={index} className={baseMessageClass}>
          <span className={`inline-block max-w-xs p-3 rounded-lg ${messageContentClass}`}>
            {msg.content}
          </span>
        </div>
      );
    }

    if (activeFeature === "voice") {
      return (
        <div key={index} className={baseMessageClass}>
          {msg.type === "user" ? (
            <span className={`inline-flex items-center max-w-xs p-3 rounded-lg ${messageContentClass}`}>
              <PlayIcon className="size-4 mr-2 text-white" />
              {Array.from({ length: 12 }).map((_, i) => (
                <AudioLines key={i} className="h-6 w-4 text-white" />
              ))}
            </span>
          ) : (
            <span className={`inline-block max-w-xs p-3 rounded-lg ${messageContentClass}`}>
              {msg.content}
            </span>
          )}
        </div>
      );
    }

    if (activeFeature === "image") {
      return (
        <div key={index} className={baseMessageClass}>
          {msg.type === "user" ? (
            <span className={`inline-flex items-center max-w-xs p-3 rounded-lg ${messageContentClass}`}>
              <div className="bg-gray-500 flex justify-center items-center rounded w-[190px] h-[220px]">
                <Image className="size-8 text-gray-900" />
              </div>
            </span>
          ) : (
            <span className={`inline-block max-w-xs p-3 rounded-lg ${messageContentClass}`}>
              {msg.content}
            </span>
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 max-w-7xl mx-auto">
      <div className="w-full md:w-1/3">
        <h2 className={`${fontHead.className} text-2xl text-left mb-4`}>
          {t("home_page.services.titles.features")}
        </h2>
        <div className="space-y-4">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className={`cursor-pointer border-0 border-b rounded-sm transition-colors duration-300 ${activeFeature === feature.id ? "bg-gray-600 text-secondary-foreground" : ""}`}
              onClick={() => setActiveFeature(feature.id)}
            >
              <CardHeader className="flex flex-row items-center space-x-4 p-4">
                <feature.icon />
                <div>
                  <CardTitle className={`${fontHead.className} text-left text-lg`}>
                    {feature.name}
                  </CardTitle>
                  <CardDescription
                    className={`text-left text-sm ${activeFeature === feature.id ? "text-secondary-foreground" : ""}`}
                  >
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      <div className="w-full md:w-2/3">
        <Card className="h-[500px] border-0 border-l rounded-none flex flex-col">
          {activeFeature && messages.length > 0 && (
            <Tabs value={activeFeature} className="flex-grow flex flex-col">
              <TabsContent
                value={activeFeature}
                className="flex-grow flex w-full flex-col"
              >
                <ScrollArea className="flex-grow p-4">
                  {messages.map((msg, index) => renderMessage(msg, index))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
          {messages.length === 0 && (
            <div className="flex md:min-w-[350px] w-full flex-col items-center justify-center h-full"></div>
          )}
        </Card>
      </div>
    </div>
  );
}