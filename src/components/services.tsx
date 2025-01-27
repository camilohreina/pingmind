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

const featuresIcons: { [key in 'text' | 'voice' | 'image']: React.ComponentType } = {
  text: MessageSquare,
  voice: Mic,
  image: ImageIcon,
};




export default function WhatsAppReminderDemo() {
  const  t  = useTranslations();
  const [activeFeature, setActiveFeature] = useState("text");
  const [messages, setMessages] = useState<any[]>([]);


  const features = (Object.keys(featuresIcons) as Array<keyof typeof featuresIcons>).map((key) => ({
    id: key,
    name: t(`home_page.services.features.${key}.name`),
    description: t(`home_page.services.features.${key}.description`),
    icon: featuresIcons[key],
  }));

  useEffect(() => {
    const demoMessages = t.raw(`home_page.services.demoMessages.${activeFeature}`);
    setMessages(demoMessages);
  }, [activeFeature, t]);


  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 max-w-7xl mx-auto">
      <div className="w-full md:w-1/3">
        <h2 className={`${fontHead.className} text-2xl text-left mb-4`}>
          Características
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
                  <CardTitle
                    className={`${fontHead.className} text-left text-lg`}
                  >
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
          <Tabs value={activeFeature} className="flex-grow flex flex-col">
            <TabsContent
              value={activeFeature}
              className="flex-grow flex w-full flex-col"
            >
              <ScrollArea className="flex-grow  p-4">
                {activeFeature === "text" &&
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 ${msg.type === "user" ? "float-right text-left" : "text-left"}`}
                    >
                      <span
                        className={`inline-block max-w-xs p-3 rounded-lg ${msg.type === "user" ? "bg-green-900 text-primary" : "bg-secondary"}`}
                      >
                        {msg.content}
                      </span>
                    </div>
                  ))}

                {activeFeature === "voice" &&
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 ${msg.type === "user" ? "float-right text-left" : "text-left"}`}
                    >
                      {msg.type === "user" ? (
                        <span
                          className={`inline-flex items-center max-w-xs p-3 rounded-lg ${msg.type === "user" ? "bg-green-900 text-primary" : "bg-secondary"}`}
                        >
                          <PlayIcon className="size-4 mr-2 text-white" />

                          {Array.from({ length: 12 }).map((_, i) => (
                            <AudioLines
                              key={i}
                              className="h-6 w-4 text-white"
                            />
                          ))}
                        </span>
                      ) : (
                        <span
                          className={`inline-block max-w-xs p-3 rounded-lg ${msg.type === "user" ? "bg-green-900 text-primary" : "bg-secondary"}`}
                        >
                          {msg.content}
                        </span>
                      )}
                    </div>
                  ))}

                {activeFeature === "image" &&
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 ${msg.type === "user" ? "float-right text-left" : "text-left"}`}
                    >
                      {msg.type === "user" ? (
                        <span
                          className={`inline-flex items-center max-w-xs p-3 rounded-lg ${msg.type === "user" ? "bg-green-900 text-primary" : "bg-secondary"}`}
                        >
                          <div className="bg-gray-500 flex justify-center items-center rounded w-[190px] h-[220px]">
                            <Image className="size-8 text-gray-900" />
                          </div>
                        </span>
                      ) : (
                        <span
                          className={`inline-block max-w-xs p-3 rounded-lg ${msg.type === "user" ? "bg-green-900 text-primary" : "bg-secondary"}`}
                        >
                          {msg.content}
                        </span>
                      )}
                    </div>
                  ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
