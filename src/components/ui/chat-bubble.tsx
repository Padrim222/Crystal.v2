import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const chatBubbleVariant = cva(
  "flex gap-2 max-w-[60%] items-end",
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
    },
    defaultVariants: {
      variant: "received",
    },
  }
);

const chatBubbleMessageVariant = cva(
  "p-4 rounded-lg break-words",
  {
    variants: {
      variant: {
        received: "bg-secondary text-secondary-foreground rounded-bl-none",
        sent: "bg-primary text-primary-foreground rounded-br-none",
      },
    },
    defaultVariants: {
      variant: "received",
    },
  }
);

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: VariantProps<typeof chatBubbleVariant>["variant"];
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant, children, ...props }, ref) => (
    <div
      className={cn(chatBubbleVariant({ variant, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
);

ChatBubble.displayName = "ChatBubble";

interface ChatBubbleAvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({
  src,
  fallback,
  className,
}) => (
  <Avatar className={cn("shrink-0", className)}>
    <AvatarImage src={src} alt="Avatar" />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
);

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: VariantProps<typeof chatBubbleMessageVariant>["variant"];
  isLoading?: boolean;
}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
  ({ className, variant, isLoading, children, ...props }, ref) => (
    <div
      className={cn(chatBubbleMessageVariant({ variant, className }))}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
);

ChatBubbleMessage.displayName = "ChatBubbleMessage";

export { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage };