package main

import (
	"flag"
	"fmt"

	esbuild "github.com/evanw/esbuild/pkg/api"
)

type NovaOptions struct {
	NoCheck bool
	Watch   bool
}

func alert(result esbuild.BuildResult) {
	fmt.Println("Brt")
	fmt.Println(result)
}

func main() {
	var options NovaOptions

	flag.BoolVar(&options.NoCheck, "noCheck", false, "Skips type checking")
	flag.BoolVar(&options.Watch, "watch", false, "Watch files and recompile when changes are made")
	flag.Parse()

	fmt.Println("Options:", options)

	var watchMode *esbuild.WatchMode = nil
	if options.Watch {
		watchMode = &esbuild.WatchMode{OnRebuild: alert}
	}

	fmt.Println(watchMode)

	result := esbuild.Build(esbuild.BuildOptions{
		EntryPoints: []string{"./main.ts"},
		Bundle:      true,
		Format:      esbuild.FormatESModule,
		JSXMode:     esbuild.JSXModePreserve,
		Outbase:     "./",
		Outdir:      "./build/",
		Watch:       watchMode,
		Write:       true,
	})

	if len(result.Errors) > 0 {
		fmt.Println("err")
	}

	if options.Watch {
		<-make(chan bool)
	}
}
