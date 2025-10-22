"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header với Theme Toggle */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Color Palette Test
            </h1>
            <Button onClick={toggleTheme} variant="outline" className="ml-4">
              {isDarkMode ? "☀️ Light" : "🌙 Dark"}
            </Button>
          </div>
          <p className="text-xl text-muted-foreground">
            Test bộ màu OKLCH mới với Light/Dark mode
          </p>
        </div>

        {/* Hero Gradient Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Gradients</CardTitle>
            <CardDescription>Test gradient backgrounds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="hero-gradient-light p-8 rounded-lg text-primary-foreground">
                <h3 className="text-2xl font-bold mb-2">Light Hero Gradient</h3>
                <p>Primary → Accent gradient</p>
              </div>
              <div className="hero-gradient-dark p-8 rounded-lg text-primary-foreground">
                <h3 className="text-2xl font-bold mb-2">Dark Hero Gradient</h3>
                <p>Primary → Accent gradient (darker)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Gradients */}
        <Card>
          <CardHeader>
            <CardTitle>Card Gradients</CardTitle>
            <CardDescription>Test card gradient backgrounds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-gradient-light border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">
                    Light Card Gradient
                  </h3>
                  <p className="text-muted-foreground">
                    White → Light blue-gray
                  </p>
                </CardContent>
              </Card>
              <Card className="card-gradient-dark border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">Dark Card Gradient</h3>
                  <p className="text-muted-foreground">Card base → Darker</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Colors</CardTitle>
              <CardDescription>Main brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary"></div>
                <span className="text-sm">Primary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-secondary"></div>
                <span className="text-sm">Secondary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-accent"></div>
                <span className="text-sm">Accent</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-destructive"></div>
                <span className="text-sm">Destructive</span>
              </div>
            </CardContent>
          </Card>

          {/* Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Background Colors</CardTitle>
              <CardDescription>Background and surface colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-background border"></div>
                <span className="text-sm">Background</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-card border"></div>
                <span className="text-sm">Card</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-popover border"></div>
                <span className="text-sm">Popover</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-muted"></div>
                <span className="text-sm">Muted</span>
              </div>
            </CardContent>
          </Card>

          {/* Border & Input Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Border & Input</CardTitle>
              <CardDescription>Border and input colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-border"></div>
                <span className="text-sm">Border</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-input border"></div>
                <span className="text-sm">Input</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-ring"></div>
                <span className="text-sm">Ring</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Chart Colors</CardTitle>
            <CardDescription>Data visualization colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="text-center">
                  <div
                    className={`w-12 h-12 rounded-lg bg-chart-${num} mx-auto mb-2`}
                  ></div>
                  <span className="text-sm">Chart {num}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Sidebar Colors</CardTitle>
            <CardDescription>Sidebar component colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-sidebar border"></div>
                <span className="text-sm">Sidebar</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-sidebar-primary"></div>
                <span className="text-sm">Primary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-sidebar-accent"></div>
                <span className="text-sm">Accent</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-sidebar-border"></div>
                <span className="text-sm">Border</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Test */}
        <Card>
          <CardHeader>
            <CardTitle>Component Test</CardTitle>
            <CardDescription>Test các component với màu mới</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buttons */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Buttons</h4>
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Badges</h4>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            {/* Form Elements */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Form Elements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
