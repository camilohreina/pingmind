"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
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

const features = [
  {
    id: "text",
    name: "Recordatorios por Texto",
    description:
      "Envía un mensaje de texto para crear un recordatorio rápidamente.",
    icon: MessageSquare,
  },
  {
    id: "voice",
    name: "Recordatorios por Voz",
    description:
      "Graba una nota de voz para crear un recordatorio sin escribir.",
    icon: Mic,
  },
  {
    id: "image",
    name: "Recordatorios con Imágenes",
    description: "Envía una imagen para crear un recordatorio visual.",
    icon: ImageIcon,
  },
];

const demoMessages = {
  text: [
    { type: "user", content: "Recordar comprar leche mañana" },
    {
      type: "bot",
      content:
        "Entendido. He creado un recordatorio para comprar leche mañana. Te enviaré una notificación en el momento adecuado.",
    },
    {
      type: "user",
      content: "Gracias, también recuérdame llamar al dentista el viernes",
    },
    {
      type: "bot",
      content:
        "Claro, he añadido un recordatorio para llamar al dentista el viernes. Te lo recordaré ese día.",
    },
  ],
  voice: [
    {
      type: "user",
      content:
        '🎤 Nota de voz: "Recordar recoger el traje de la tintorería el jueves"',
    },
    {
      type: "bot",
      content:
        "He procesado tu nota de voz y creado un recordatorio para recoger el traje de la tintorería el jueves. Te enviaré un mensaje ese día para recordártelo.",
    },
    {
      type: "user",
      content: '🎤 Nota de voz: "Comprar regalo de cumpleaños para mamá"',
    },
    {
      type: "bot",
      content:
        "Entendido. He creado un recordatorio para comprar un regalo de cumpleaños para tu mamá. ¿Quieres que te sugiera una fecha específica para este recordatorio?",
    },
  ],
  image: [
    { type: "user", content: "🖼️ Imagen: Cartel de un concierto" },
    {
      type: "bot",
      content:
        "He analizado la imagen del cartel del concierto. He creado un recordatorio para el evento el día 15 de julio a las 20:00. Te avisaré una semana antes y el día del concierto.",
    },
  ],
};

export default function WhatsAppReminderDemo() {
  const [activeFeature, setActiveFeature] = useState("text");
  const [messages, setMessages] = useState(demoMessages.text);

  useEffect(() => {
    setMessages(demoMessages[activeFeature as keyof typeof demoMessages]);
  }, [activeFeature]);

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
                <feature.icon size={24} />
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
          {/*  <CardHeader>
            <CardTitle>Demo de WhatsApp Reminder</CardTitle>
            <CardDescription>Ejemplo de interacción para cada tipo de recordatorio</CardDescription>
          </CardHeader> */}
          <Tabs value={activeFeature} className="flex-grow flex flex-col">
            {/* <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text">Texto</TabsTrigger>
              <TabsTrigger value="voice">Voz</TabsTrigger>
              <TabsTrigger value="image">Imagen</TabsTrigger>
            </TabsList> */}
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
