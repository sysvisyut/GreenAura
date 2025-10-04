import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

type StaticCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  animate?: false;
};

type AnimatedCardProps = Omit<import("framer-motion").HTMLMotionProps<"div">, "ref"> & {
  children: React.ReactNode;
  animate: true;
};

type CardProps = StaticCardProps | AnimatedCardProps;

export function Card({ className, children, animate = false, ...props }: CardProps) {
  if (animate) {
    const motionProps = props as AnimatedCardProps;
    const { animate: _isAnimated, ...restMotionProps } = motionProps as any;
    return (
      <motion.div
        className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        {...restMotionProps}>
        {children}
      </motion.div>
    );
  }

  const divProps = props as StaticCardProps;
  const { animate: _isAnimated, ...restDivProps } = divProps as any;
  return (
    <div
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...restDivProps}>
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}
